# Demo Data Guide - "The Online Store Mystery"

## Story Overview
An online electronics store's best-selling product (Premium Wireless Headphones) develops quality issues, causing sales to collapse from $2K+/day to $0. The AI agent investigates using multiple database capabilities.

---

## Products

| ID | Name | Category | Price | Role in Story |
|----|------|----------|-------|---------------|
| 1 | Premium Wireless Headphones | Electronics | $299.99 | **Product X** - The problem! Quality issues |
| 2 | Smart Fitness Watch | Electronics | $249.99 | **Product Y** - Emerging similar issues |
| 3 | Bluetooth Speaker | Electronics | $89.99 | Normal - positive reviews |
| 4 | USB-C Cable | Accessories | $19.99 | Budget item - no issues |
| 5 | Laptop Stand | Accessories | $49.99 | Normal - positive reviews |

---

## Sales Timeline

### Week 1 (14-8 days ago): Normal Operations
- **Premium Wireless Headphones**: BEST SELLER
- Daily revenue: **$2,000-2,700**
- Pattern: 3-4 units sold daily, high customer satisfaction

### Week 2 (7-4 days ago): Quality Issues Begin
- **Day 7**: First complaints appear, sales still normal ($2,100)
- **Day 6**: Sales starting to slip ($1,200)
- **Day 5**: Word spreading ($900)
- **Day 4**: Major decline ($600)

### Recent Days (3 days ago - today): Collapse
- **Day 3**: Sales collapsed ($300 - single order)
- **Day 2**: Nearly dead ($300 - single order)
- **Yesterday**: **ZERO SALES** 
- **Today**: **ZERO SALES**

### Key Metrics
- **Normal daily revenue** (Product X): $2,000-2,700
- **Current daily revenue** (Product X): $0
- **Revenue drop**: 100% (complete collapse)
- **Weekly loss**: ~$14,000 (2 weeks at $0 vs normal)

---

## User Feedback Breakdown

### Product X: Premium Wireless Headphones (27 feedbacks)

#### Direct Mentions (12 feedbacks)
Clear keyword matches with product name:
- "Premium Wireless Headphones stopped working after 2 days"
- "Defective unit - Premium Wireless Headphones have static noise"
- "BROKEN! Premium Wireless Headphones arrived with cracked casing"

**Use case**: Full-text search finds these easily

#### Semantic Variations (15 feedbacks)
No product name, but semantically about Premium Wireless Headphones:
- "The expensive headphones I bought broke immediately"
- "Your $299 headphones are broken!"
- "The flagship audio product has terrible build quality"
- "Your most expensive headphones have connectivity issues"
- "The high-end wireless earphones I got are defective"
- "The expensive audio equipment failed"
- "The flagship wireless headphones are a disappointment"
- "Your top-tier audio product broke on first use"
- "The $299 wireless headphones stopped working"
- "The premium audio device I purchased has major quality control problems"
- "The high-end headphones have buzzing noise"
- "The flagship headphones. Broke within a week"

**Use case**: Semantic search required! Keywords would miss these.

#### Subtle Complaints (overlaps with above)
No obvious negative keywords:
- "Not what I expected for this price"
- "Disappointed with my purchase. Expected much better"
- "Not worth it at all"
- "Waste of money"
- "Would not recommend these headphones to anyone"
- "Expected better from such an expensive product"
- "Cannot believe I paid $299 for these"

**Use case**: Hybrid search catches both obvious + subtle

### Product Y: Smart Fitness Watch (8 feedbacks)
**Emerging pattern** - same timeline, similar issues:
- Started 4 days ago (3 days after Product X issues)
- 8 complaints in 4 days
- Similar language: "poor quality", "broke", "defective"
- Shows this is likely a **supplier-wide problem**

### Other Products (9 positive feedbacks)
Baseline showing normal products are fine:
- Bluetooth Speaker: 4 positive reviews
- Laptop Stand: 3 positive reviews  
- USB-C Cable: 2 positive reviews

---

## Customer Value Analysis

### High-Value Complaining Customers
Many complainers are **repeat customers** with purchase history:
- Customer 1001: Bought Premium Wireless Headphones 14 days ago ($900)
- Customer 1002: Bought 14 days ago ($600)
- Customer 1005: Multiple purchases
- Customer 1008: Multiple purchases

**Demo capability**: Show customer lifetime value at risk

### Behavior After Complaint
Timeline shows customers **stopped buying after complaining**:
- Complained on Day 7 → No orders Day 8-today
- This is trackable in orders table by customer_id

---

## Demo Query Examples

### Q1: Sales Analysis
```sql
-- Show sales drop
SELECT 
  order_date,
  COUNT(*) FILTER (WHERE product_name = 'Premium Wireless Headphones') as orders,
  SUM(amount) FILTER (WHERE product_name = 'Premium Wireless Headphones') as revenue
FROM orders
WHERE order_date >= CURRENT_DATE - 14
GROUP BY order_date
ORDER BY order_date;

-- Avg before vs yesterday
-- Before (days 8-14): $2,000-2,700/day
-- Yesterday: $0
```

### Q2: Hybrid Search for Quality Complaints
```sql
-- This will be implemented in the agent
-- Combines full-text + semantic search
-- Should find all 27 complaints about Product X
```

### Q3: Pattern Across Products
```sql
-- Show both Product X and Y have issues
SELECT 
  product_referenced,
  COUNT(*) as complaints,
  MIN(created_at) as first_complaint
FROM user_feedback
WHERE sentiment = 'negative'
  AND product_referenced IN ('Premium Wireless Headphones', 'Smart Fitness Watch')
GROUP BY product_referenced;
```

### Q4: Customer Lifetime Value at Risk
```sql
-- Customers who complained + their total purchases
WITH complaining_customers AS (
  SELECT DISTINCT customer_id
  FROM user_feedback
  WHERE sentiment = 'negative'
    AND created_at >= CURRENT_DATE - 7
)
SELECT 
  COUNT(DISTINCT o.customer_id) as affected_customers,
  SUM(o.amount) as lifetime_value_at_risk,
  AVG(orders_per_customer) as avg_orders_each
FROM orders o
JOIN complaining_customers cc ON o.customer_id = cc.customer_id
GROUP BY o.customer_id;
```

---

## Semantic Search Test Cases

### Should Find (semantic matches):
- "expensive headphones" → Premium Wireless Headphones
- "$299 headphones" → Premium Wireless Headphones  
- "flagship audio" → Premium Wireless Headphones
- "top-tier audio product" → Premium Wireless Headphones
- "high-end wireless earphones" → Premium Wireless Headphones
- "premium audio device" → Premium Wireless Headphones

### Subtle Sentiment (should detect):
- "Not what I expected" → negative complaint
- "Disappointed with purchase" → negative complaint
- "Waste of money" → negative complaint
- "Not worth it" → negative complaint
- "Would not recommend" → negative complaint

### Cross-Product Pattern:
- Search "quality issues" → Should find BOTH Product X and Product Y
- Shows this is systemic, not isolated

---

## Demo Flow Verification

### Question 1: "Sales dropped yesterday compared to last week - why?"
**Expected**: Agent finds Product X revenue went from $2K+/day → $0

### Question 2: "What are customers saying about Product X?"
**Expected**: Hybrid search finds 27 complaints (12 direct + 15 semantic)

### Question 3: "Are other products having similar problems?"
**Expected**: Agent finds Product Y showing same pattern (8 complaints)

### Question 4: "Which customers are we losing?"
**Expected**: 23 high-value customers, many stopped buying after complaining

### Question 5: "What should I do right now?"
**Expected**: Agent synthesizes findings, recommends stopping sales, contacting supplier

### Question 6: "How did you figure all this out?"
**Expected**: Agent shows it used one database with multiple capabilities

---

## Setup Instructions

1. **Run migration** (if not already done):
   ```bash
   npm run migrate
   ```

2. **Load seed data**:
   ```bash
   npm run setup
   ```

3. **Populate embeddings**:
   ```bash
   npm run populate-embeddings
   ```
   This generates vector embeddings for all feedback using pgai's `ai.openai_embed()` IN Postgres

4. **Test a query**:
   ```bash
   npm run dev "Sales dropped yesterday compared to last week - why?"
   ```

---

## Data Statistics

- **Total Orders**: ~140 orders over 14 days
- **Total Customers**: ~70 unique customers
- **Total Feedback**: 44 entries
  - Negative about Product X: 27
  - Negative about Product Y: 8
  - Positive (other products): 9
- **Revenue Impact**: 
  - Normal weekly Product X revenue: $14,000
  - Lost this week: $14,000 (2 weeks at $0)
  - Customer LTV at risk: Calculate via query

---

## Why This Data Works

1. **Realistic**: Actual e-commerce scenario anyone can understand
2. **Clear Pattern**: Visible sales drop correlated with complaints
3. **Multiple Signals**: Direct mentions, semantic variations, subtle complaints
4. **Cross-Product**: Shows systemic issue (Product Y emerging)
5. **Customer Impact**: Real business metrics (LTV, retention)
6. **Timeline**: Clear cause-effect relationship
7. **Searchable**: Tests all search capabilities (FTS, semantic, hybrid)

**This data tells a complete story that resonates with business owners and showcases all Timescale capabilities!** 🎯

