#!/bin/bash

# Load environment variables
source .env

# Get service connection
SERVICE_ID="lr5jdh6ah6"

echo "🔄 Populating embeddings using TigerData's ai.openai_embed()..."
echo ""

# Use Tiger MCP to execute the embedding generation
# This showcases TigerData's capability to run embeddings IN the database!

cat << EOF | tiger db execute --service-id $SERVICE_ID
-- Generate embeddings for all feedback using pgai (runs IN the database!)
UPDATE user_feedback
SET embedding = ai.openai_embed(
    'text-embedding-3-small',
    feedback_text,
    '$OPENAI_API_KEY'  -- Pass API key directly
)::vector
WHERE embedding IS NULL;

-- Verify embeddings were created
SELECT 
    COUNT(*) as total_feedback,
    COUNT(embedding) as with_embeddings,
    COUNT(*) - COUNT(embedding) as missing_embeddings
FROM user_feedback;
EOF

echo ""
echo "✅ Embeddings populated using TigerData's pgai extension!"
echo "💡 Embeddings were generated INSIDE the database - no external API calls from Node.js!"

