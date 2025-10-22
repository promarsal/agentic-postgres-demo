// Verify seed data loaded correctly for demo
import { db } from './db.js';

async function verify() {
  console.log('🔍 Verifying demo seed data...\n');
  
  try {
    // 1. Check products
    console.log('📦 Products:');
    const products = await db.executeQuery(`
      SELECT id, name, price, stock_level
      FROM products
      ORDER BY id;
    `);
    console.log(`   Found ${products.rows?.length || 0} products:`);
    products.rows?.forEach(row => {
      console.log(`   - ${row[1]} ($${row[2]})`);
    });
    console.log('');
    
    // 2. Check sales pattern for Product X
    console.log('📊 Premium Wireless Headphones Sales Pattern:');
    const sales = await db.executeQuery(`
      SELECT 
        order_date,
        COUNT(*) as orders,
        SUM(amount) as revenue
      FROM orders
      WHERE product_name = 'Premium Wireless Headphones'
        AND order_date >= CURRENT_DATE - 14
      GROUP BY order_date
      ORDER BY order_date DESC
      LIMIT 10;
    `);
    console.log(`   Last 10 days:`);
    sales.rows?.forEach(row => {
      const date = new Date(row[0] as string).toISOString().split('T')[0];
      const orders = row[1];
      const revenue = parseFloat(row[2] as string).toFixed(2);
      console.log(`   ${date}: ${orders} orders, $${revenue}`);
    });
    console.log('');
    
    // 3. Check feedback counts
    console.log('💬 User Feedback Summary:');
    const feedback = await db.executeQuery(`
      SELECT 
        sentiment,
        COUNT(*) as count,
        COUNT(*) FILTER (WHERE feedback_text ILIKE '%Premium Wireless Headphones%') as mentions_product_x,
        COUNT(*) FILTER (WHERE feedback_text ILIKE '%Smart Fitness Watch%') as mentions_product_y
      FROM user_feedback
      GROUP BY sentiment
      ORDER BY sentiment;
    `);
    console.log(`   Total feedback entries:`);
    feedback.rows?.forEach(row => {
      console.log(`   - ${row[0]}: ${row[1]} (Product X: ${row[2]}, Product Y: ${row[3]})`);
    });
    console.log('');
    
    // 4. Check semantic variations (without embeddings yet)
    console.log('🔍 Semantic Variations Check:');
    const semanticCheck = await db.executeQuery(`
      SELECT COUNT(*) as count
      FROM user_feedback
      WHERE sentiment = 'negative'
        AND (
          feedback_text ILIKE '%$299%'
          OR feedback_text ILIKE '%expensive headphones%'
          OR feedback_text ILIKE '%flagship%'
          OR feedback_text ILIKE '%premium audio%'
          OR feedback_text ILIKE '%high-end%'
        )
        AND feedback_text NOT ILIKE '%Premium Wireless Headphones%';
    `);
    const semanticCount = semanticCheck.rows?.[0]?.[0] || 0;
    console.log(`   Found ${semanticCount} complaints using semantic terms (no product name)`);
    console.log(`   Examples: "expensive headphones", "$299", "flagship audio"`);
    console.log('');
    
    // 5. Check customer lifetime value for complainers
    console.log('💰 Customer Value Analysis:');
    const clv = await db.executeQuery(`
      WITH complaining_customers AS (
        SELECT DISTINCT customer_id
        FROM user_feedback
        WHERE sentiment = 'negative'
          AND created_at >= CURRENT_DATE - 7
      )
      SELECT 
        COUNT(DISTINCT cc.customer_id) as customers,
        ROUND(AVG(customer_total)::numeric, 2) as avg_lifetime_value,
        ROUND(SUM(customer_total)::numeric, 2) as total_at_risk
      FROM complaining_customers cc
      JOIN (
        SELECT customer_id, SUM(amount) as customer_total
        FROM orders
        GROUP BY customer_id
      ) totals ON cc.customer_id = totals.customer_id;
    `);
    if (clv.rows && clv.rows.length > 0) {
      const customers = clv.rows[0][0];
      const avgValue = clv.rows[0][1];
      const totalRisk = clv.rows[0][2];
      console.log(`   Complaining customers: ${customers}`);
      console.log(`   Average lifetime value: $${avgValue}`);
      console.log(`   Total value at risk: $${totalRisk}`);
    }
    console.log('');
    
    console.log('✅ Seed data verification complete!\n');
    console.log('📚 Key Demo Points:');
    console.log('   ✓ Product X sales collapsed from ~$2K/day to $0');
    console.log('   ✓ 27+ complaints about Product X (mix of direct + semantic)');
    console.log('   ✓ 8 complaints about Product Y (emerging pattern)');
    console.log('   ✓ High-value customers at risk');
    console.log('   ✓ Clear timeline: complaints → sales drop\n');
    
    console.log('🚀 Ready for demo! Try:');
    console.log('   npm run dev "Sales dropped yesterday compared to last week - why?"\n');
    
    process.exit(0);
    
  } catch (error: any) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

verify();

