-- Configure OpenAI API Key for pgai extension
-- This must be run before using ai.openai_embed() functions

-- Set the OPENAI_API_KEY as a Postgres setting
-- Replace 'your-openai-api-key-here' with your actual key
ALTER DATABASE postgres SET ai.openai_api_key TO 'your-openai-api-key-here';

-- Or set it for the current session:
-- SELECT set_config('ai.openai_api_key', 'your-openai-api-key-here', false);

-- Verify it's set:
-- SELECT current_setting('ai.openai_api_key');

