# Semantic Clustering with pgvectorscale

This demo showcases **TigerData's pgvectorscale** DiskANN index for semantic clustering of user feedback without predefined categories.

## What Makes This Special

❌ **Traditional Approach**: Keyword matching with hardcoded categories
```sql
CASE 
    WHEN feedback_text ILIKE '%slow%' THEN 'Performance'
    WHEN feedback_text ILIKE '%bug%' THEN 'Bugs'
    ...
END
```

✅ **Semantic Clustering**: Discovers natural topic groups using vector similarity
```sql
-- Uses pgvectorscale DiskANN index for fast nearest-neighbor search
SELECT feedback_text <=> other_feedback.embedding
FROM user_feedback
```

## Demo Queries

### 1. Simple Agent Query

Ask the agent to discover clusters:

```bash
npm run dev "Use vector similarity to find natural clusters in user feedback. For each cluster, show the theme, count, and sample members."
```

### 2. Direct SQL: Basic Clustering by Sentiment

```sql
-- Shows how feedback naturally groups by sentiment using embeddings
WITH cluster_seeds AS (
    SELECT DISTINCT ON (sentiment)
        id, feedback_text, sentiment, embedding
    FROM user_feedback
    ORDER BY sentiment, id
),
clustered_feedback AS (
    SELECT 
        uf.id,
        uf.feedback_text,
        cs.sentiment as cluster_theme,
        cs.feedback_text as representative,
        (1 - (uf.embedding <=> cs.embedding)) as similarity,
        ROW_NUMBER() OVER (
            PARTITION BY uf.id 
            ORDER BY (uf.embedding <=> cs.embedding)
        ) as cluster_rank
    FROM user_feedback uf
    CROSS JOIN cluster_seeds cs
)
SELECT 
    cluster_theme,
    COUNT(*) as members,
    LEFT(representative, 60) as example,
    ROUND(AVG(similarity)::numeric, 3) as cohesion
FROM clustered_feedback
WHERE cluster_rank = 1
GROUP BY cluster_theme, representative
ORDER BY members DESC;
```

### 3. Direct SQL: Topic Discovery Clustering

```sql
-- Discovers natural topic clusters (not just sentiment)
WITH seed_selection AS (
    SELECT id, feedback_text, embedding
    FROM user_feedback
    WHERE id IN (1, 5, 10, 15, 20, 25)  -- Sample diverse points
),
nearest_cluster AS (
    SELECT 
        uf.id,
        uf.feedback_text,
        ss.id as cluster_id,
        ss.feedback_text as cluster_center,
        (1 - (uf.embedding <=> ss.embedding)) as similarity,
        ROW_NUMBER() OVER (
            PARTITION BY uf.id 
            ORDER BY (uf.embedding <=> ss.embedding)
        ) as rank
    FROM user_feedback uf
    CROSS JOIN seed_selection ss
)
SELECT 
    'Cluster ' || cluster_id as cluster_name,
    LEFT(cluster_center, 50) as theme,
    COUNT(*) as members,
    ROUND(AVG(similarity)::numeric, 3) as cohesion,
    ARRAY_AGG(LEFT(feedback_text, 35) ORDER BY similarity DESC) 
        FILTER (WHERE rank = 1) 
        as sample_members
FROM nearest_cluster
WHERE rank = 1
GROUP BY cluster_id, cluster_center
ORDER BY members DESC
LIMIT 6;
```

## How It Works

1. **DiskANN Index**: `pgvectorscale`'s advanced index enables fast k-NN search
2. **Cosine Similarity**: Uses `<=>` operator to measure semantic distance
3. **Cluster Assignment**: Each feedback assigned to nearest seed point
4. **Cohesion Metric**: Average similarity within cluster (higher = tighter)

## Example Output

```
┌────────────┬──────────────────────────────────────────┬─────────┬──────────┐
│ cluster    │ theme                                    │ members │ cohesion │
├────────────┼──────────────────────────────────────────┼─────────┼──────────┤
│ Cluster 1  │ Performance issues (slow, crashes)       │    9    │  0.440   │
│ Cluster 5  │ UI/UX concerns (navigation, design)      │    7    │  0.519   │
│ Cluster 20 │ Pricing discussions                      │    5    │  0.563   │
│ Cluster 15 │ Support response times                   │    3    │  0.646   │
│ Cluster 25 │ Bugs & integrations                      │    3    │  0.573   │
│ Cluster 10 │ Feature requests                         │    2    │  0.615   │
└────────────┴──────────────────────────────────────────┴─────────┴──────────┘
```

## Key Benefits

✅ **No predefined categories** - Discovers themes automatically
✅ **Semantic understanding** - Groups by meaning, not keywords
✅ **Fast at scale** - DiskANN index handles millions of vectors
✅ **All in Postgres** - No external clustering services needed

## Advanced: K-Means Style Clustering

For production use, you could implement k-means clustering entirely in SQL:

```sql
-- Iterative k-means clustering in Postgres
-- (Requires multiple iterations to converge)

1. Initialize random centroids
2. Assign each point to nearest centroid (using pgvectorscale)
3. Recalculate centroids as mean of cluster members
4. Repeat until convergence
```

## Try It Yourself

```bash
# Run the agent with semantic clustering
npm run dev "Discover natural topic clusters in user feedback using vector similarity. Show cluster themes, sizes, and cohesion scores."

# Or test directly via Tiger MCP
tiger db execute --service-id lr5jdh6ah6 < semantic_clustering.sql
```

## Resources

- [pgvectorscale Documentation](https://docs.tigerdata.com/ai/latest/sql-interface-for-pgvector-and-timescale-vector/)
- [DiskANN Paper](https://arxiv.org/abs/1907.05046)
- [Agentic Postgres Blog](https://www.tigerdata.com/blog/postgres-for-agents)

