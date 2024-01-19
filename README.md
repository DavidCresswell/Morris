# Morris - Discord Voice AI Chatbot

Morris is an AI chatbot integrated with Discord voice channels. The bot uses local keyword detection using PicoVoice, and responds using models running on CloudFlare, OpenAI, and ElevenLabs.


## Configuration
- Choose which services to use. The defaults are recommended.
- Get API keys for Discord and selected API services.
- Set the appropriate environment variables

## Environment Variables

### General

| Variable Name             | Values  | Defaults                                                                                                         | Description                                                      |
|---------------------------|---------|------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------|
| DISCORD_API_TOKEN         | string  | ''                                                                                                               | Discord bot API token.                                           |
| STREAM_ASSISTANT_TO_TTS   | boolean | false                                                                                                            | Whether to stream assistant responses to text-to-speech service. |
| STREAM_TTS_OUTPUT         | boolean | false                                                                                                            | Whether to stream text-to-speech output. Currently bugged.       |
| KEEP_LAST_N_INTERACTIONS  | number  | 5                                                                                                                | Number of interactions to keep in the conversation history.      |
| KEEP_INTERACTION_DURATION | number  | 300000 (5 minutes)                                                                                               | Duration in milliseconds to keep an interaction in the history.  |
| SYSTEM_PROMPT             | string  | 'You must answer all questions succinctly. Today is {{date}} and the time is {{time}}. Keep the response short.' | System prompt. You should change this to fit your bot.           |

### Service Selection

| Variable Name          | Values                                | Defaults     | Description                                                                                                                                            |
|------------------------|---------------------------------------|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| WAKEWORD_SERVICE       | 'porcupine'                           | 'porcupine'  | Wake word detection service.                                                                                                                           |
| SPEECH_TO_TEXT_SERVICE | 'openai' \| 'cloudflare'              | 'cloudflare' | Service for converting spoken language into written text.                                                                                              |
| ASSISTANT_SERVICE      | 'openai' \| 'cloudflare'              | 'cloudflare' | Service for providing the responses from the bot. OpenAI not recommended unless you only want a formal "assistant" bot. It won't act a character well. |
| TEXT_TO_SPEECH_SERVICE | 'elevenlabs' \| 'coqui' \| 'charactr' | 'elevenlabs' | Service for converting text into spoken language.                                                                                                      |

### PicoVoice / Porcupine (Wakeword Detection)

| Variable Name | Values | Defaults                           | Description                                                                                                                            |
|---------------|--------|------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| PICOVOICE_KEY | string | ''                                 | API key for PicoVoice                                                                                                                  |
| WAKEWORD      | string | `Morris_en_${platform}_v3_0_0.ppn` | Custom wake word file for porcupine, either looks in the "wakeword" directory or specify an absolute path                              |
| SENSITIVITY   | string | '1'                                | 0-1, A higher sensitivity reduces miss rate at cost of increased false alarm rate. In my experience false positives are rare even at 1 |

### Cloudflare (STT, Assistant)

| Variable Name         | Values | Defaults                               | Description                                                                                     |
|-----------------------|--------|----------------------------------------|-------------------------------------------------------------------------------------------------|
| CLOUDFLARE_ACCOUNT_ID | string | ''                                     | Cloudflare Account ID                                                                           |
| CLOUDFLARE_API_TOKEN  | string | ''                                     | API token for accessing Cloudflare workers AI service.                                          |
| CLOUDFLARE_MODEL_ID   | string | '@cf/mistral/mistral-7b-instruct-v0.1' | https://developers.cloudflare.com/workers-ai/models/text-generation/#available-embedding-models |


### OpenAI (STT, Assistant)

| Variable Name         | Values | Defaults             | Description                                                                                                                              |
|-----------------------|--------|----------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| OPENAI_KEY            | string | ''                   | API key for OpenAI language model service.                                                                                               |
| OPENAI_MODEL          | string | 'gpt-3.5-turbo-1106' | OpenAI assistant model                                                                                                                   |
| OPENAI_WHISPER_PROMPT | string | 'Hello, Morris.'     | Prompt used for the OpenAI whisper (speech to text) service. Words specified here are more likely to be understood and spelled correctly |

### ElevenLabs (TTS)

| Variable Name                         | Values                | Defaults                 | Description                                                                                  |
|---------------------------------------|-----------------------|--------------------------|----------------------------------------------------------------------------------------------|
| ELEVENLABS_XI_API_KEY                 | string                | ''                       | API key for Eleven Labs.                                                                     |
| ELEVENLABS_MODEL_ID                   | string                | 'eleven_multilingual_v2' | Model ID for a specific language model in Eleven Labs.                                       |
| ELEVENLABS_VOICE_ID                   | string                | '21m00Tcm4TlvDq8ikWAM'   | Voice ID for a specific voice in Eleven Labs. Default is "Rachel" from their default voices. |
| ELEVENLABS_VOICE_STABILITY            | number                | 0.5                      | Stability parameter for Eleven Labs voice synthesis.                                         |
| ELEVENLABS_VOICE_SIMILARITY_BOOST     | number                | 0.9                      | Similarity boost for Eleven Labs voice synthesis.                                            |
| ELEVENLABS_VOICE_STYLE                | number                | 0.66                     | Style parameter for Eleven Labs voice synthesis.                                             |
| ELEVENLABS_VOICE_USE_SPEAKER_BOOST    | boolean               | false                    | Whether to use speaker boost in Eleven Labs voice synthesis.                                 |
| ELEVENLABS_OPTIMIZE_STREAMING_LATENCY | 0 \| 1 \| 2 \| 3 \| 4 | 4                        | Level of optimization for streaming latency in Eleven Labs.                                  |
| ELEVENLABS_OUTPUT_FORMAT              | 'pcm_16000'           | 'pcm_16000'              | Output format for Eleven Labs voice synthesis. Currently only pcm_16000 will work properly.  |

### Gemelo / Charactr (TTS)

Not recommended due to poor voice quality

| Variable Name       | Values | Defaults | Description                                        |
|---------------------|--------|----------|----------------------------------------------------|
| CHARACTR_API_KEY    | string | ''       | API key for Charactr                               |
| CHARACTR_CLIENT_KEY | string | ''       | Client key for Charactr                            |
| CHARACTR_VOICE_ID   | number | 143      | Voice ID for a specific voice in Charactr service. |

### Coqui (TTS)

Not recommended due to poor voice quality

| Variable Name      | Values | Defaults                        | Description                                         |
|--------------------|--------|---------------------------------|-----------------------------------------------------|
| COQUI_TTS_ENDPOINT | string | 'http://localhost:5002/api/tts' | Endpoint for the Coqui text-to-speech service.      |
| COQUI_SPEAKER_ID   | string | ''                              | Identifier for a specific speaker in Coqui service. |
