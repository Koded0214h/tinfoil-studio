

Open API Client
Powered by Scalar
v0.3.0
OAS 3.1.0
Pollinations API
Introduction

Generate text, images, video, and audio with a single API. OpenAI-compatible — use any OpenAI SDK by changing the base URL.

Base URL: https://gen.pollinations.ai

Get your API key: enter.pollinations.ai
Overview
Capability 	Endpoint 	Format
✍️ Text Generation 	POST /v1/chat/completions 	OpenAI-compatible
✍️ Simple Text 	GET /text/{prompt} 	Plain text
🖼️ Image Generation 	GET /image/{prompt} 	JPEG / PNG
🎬 Video Generation 	GET /video/{prompt} 	MP4
🔊 Text-to-Speech 	GET /audio/{text} 	MP3
🔊 Music Generation 	GET /audio/{text} 	MP3
🔊 Transcription 	POST /v1/audio/transcriptions 	JSON
🤖 Model Discovery 	GET /v1/models 	JSON
Quick Start
Generate an Image

Paste this URL in your browser — no code needed:

https://gen.pollinations.ai/image/a%20cat%20in%20space

Or use it directly in HTML:

<img src="https://gen.pollinations.ai/image/a%20cat%20in%20space" />

Generate Text (OpenAI-compatible)

curl https://gen.pollinations.ai/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "openai", "messages": [{"role": "user", "content": "Hello!"}]}'

Generate Speech

curl "https://gen.pollinations.ai/audio/Hello%20world?voice=nova" \
  -H "Authorization: Bearer YOUR_API_KEY" -o speech.mp3

🖥️ CLI

@pollinations_ai/cli wraps this API for terminals and agents. Structured --json output, deterministic exit codes, friendly 402 balance hints, stdin piping.

npm install -g @pollinations_ai/cli
polli auth login
polli gen image "a cat in space" --model flux --output cat.png
polli gen text "summarize this" < notes.md
polli models --type image

Source: github.com/pollinations/pollinations/tree/main/packages/polli-cli
🔐 Authentication

All generation requests require an API key from enter.pollinations.ai. Model listing endpoints work without authentication.

Two key types:
Type 	Prefix 	Use case 	Rate limits
Secret 	sk_ 	Server-side apps 	None
Publishable 	pk_ 	Client-side apps (beta) 	1 pollen/IP/hour

How to authenticate:

# Option 1: Authorization header (recommended)
curl -H "Authorization: Bearer YOUR_API_KEY" ...

# Option 2: Query parameter
curl "https://gen.pollinations.ai/text/hello?key=YOUR_API_KEY"

    Warning: Never expose secret keys (sk_) in client-side code. Use publishable keys (pk_) for frontend apps.

❌ Errors

All errors return JSON with a consistent format:

{
  "status": 400,
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Description of what went wrong"
  }
}

Status 	Meaning
400 	Invalid parameters or malformed request
401 	Missing or invalid API key
402 	Insufficient pollen balance
403 	API key lacks required permission
500 	Internal server error
Server
Server:https://gen.pollinations.ai

pollinations.ai API key (pk_ or sk_)
Bearer Token
:
Client Libraries
Python http.client
✍️ Text Generation ​

Generate text responses using AI models. Fully compatible with the OpenAI Chat Completions API — use any OpenAI SDK by changing the base URL.
Endpoint 	Best for
POST /v1/chat/completions 	Full OpenAI compatibility — streaming, tools, vision, structured outputs
GET /text/{prompt} 	Quick prototyping — simple GET, returns plain text

Available models: openai, openai-fast, openai-large, gpt-5.5, qwen-coder, mistral, openai-audio, openai-audio-large, gemini, gemini-flash-lite-3.1, gemini-fast, deepseek, deepseek-pro, grok, grok-large, gemini-search, midijourney, midijourney-large, claude-fast, claude, claude-large, claude-opus-4.7, perplexity-fast, perplexity-reasoning, kimi, kimi-k2.6, gemini-large, nova-fast, nova, glm, llama, minimax, mistral-large, polly, qwen-coder-large, qwen-large, qwen-vision, qwen-safety
✍️ Text Generation Operations

    post/v1/chat/completions
    post/text
    get/text/{prompt}

Chat Completions​

Generate text responses using AI models. Fully compatible with the OpenAI Chat Completions API — use any OpenAI SDK by pointing it to https://gen.pollinations.ai.

Supports streaming, function calling, vision (image input), structured outputs, and reasoning/thinking modes depending on the model.
Body
application/json

    messages
    Type: array
    required
    audio
    Type: object
    frequency_penalty
    Type: number
    min:  
    -2
    max:  
    2 nullable
    function_call
        Type: stringenum
        values
            none
            auto
    functions
    Type: array object[] 1…128
    logit_bias
    Type: object nullable
    logprobs
    Type: boolean nullable
    max_tokens
    Type: integer
    min:  
    0
    max:  
    9007199254740991 nullable

    Integer numbers.
    modalities
    Type: array string[]enum
    values
        text
        audio
    model
    Type: string

    AI model for text generation. See /v1/models for full list.
    parallel_tool_calls
    Type: boolean
    presence_penalty
    Type: number
    min:  
    -2
    max:  
    2 nullable

Responses

    application/json

    application/json

    application/json

    application/json

    application/json

    application/json

    application/json

Request Example for post/v1/chat/completions

import http.client
import json

conn = http.client.HTTPSConnection("gen.pollinations.ai")

payload = json.dumps({
  "messages": [
    {
      "content": "",
      "role": "system",
      "name": "",
      "cache_control": {
        "type": "ephemeral"
      }
    }
  ],
  "model": "openai",
  "modalities": [
    "text"
  ],
  "audio": {
    "voice": "alloy",
    "format": "wav"
  },
  "frequency_penalty": 0,
  "repetition_penalty": 0,
  "logit_bias": None,
  "logprobs": False,
  "top_logprobs": 0,
  "max_tokens": 0,
  "presence_penalty": 0,
  "response_format": {
    "type": "text"
  },
  "seed": -1,
  "stop": "",
  "stream": False,
  "stream_options": {
    "include_usage": True
  },
  "thinking": {
    "type": "disabled",
    "budget_tokens": 1
  },
  "reasoning_effort": "none",
  "thinking_budget": 0,
  "temperature": 0,
  "top_p": 0,
  "tools": [
    {
      "type": "function",
      "function": {
        "description": "",
        "name": "",
        "parameters": {},
        "strict": False
      }
    }
  ],
  "tool_choice": "none",
  "parallel_tool_calls": True,
  "user": "",
  "function_call": "none",
  "functions": [
    {
      "description": "",
      "name": "",
      "parameters": {}
    }
  ]
})
headers = {
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_SECRET_TOKEN"
}

conn.request(
    "POST",
    "/v1/chat/completions",
    body=payload,
    headers=headers,
)

response = conn.getresponse()
print(response.read().decode())

conn.close()

{
  "id": "string",
  "choices": [
    {
      "finish_reason": "string",
      "index": 0,
      "message": {
        "content": "string",
        "tool_calls": [
          {
            "id": "string",
            "type": "function",
            "function": {
              "name": "string",
              "arguments": "string"
            }
          }
        ],
        "role": "assistant",
        "function_call": {
          "arguments": "string",
          "name": "string"
        },
        "content_blocks": [
          {
            "type": "text",
            "text": "string",
            "cache_control": {
              "type": "ephemeral"
            }
          }
        ],
        "audio": {
          "transcript": "string",
          "data": "string",
          "id": "string",
          "expires_at": -9007199254740991
        },
        "reasoning_content": "string"
      },
      "logprobs": {
        "content": [
          {
            "token": "string",
            "logprob": 1,
            "bytes": [
              "[Max Depth Exceeded]"
            ],
            "top_logprobs": [
              {
                "token": "[Max Depth Exceeded]",
                "logprob": "[Max Depth Exceeded]",
                "bytes": "[Max Depth Exceeded]"
              }
            ]
          }
        ]
      },
      "content_filter_results": {
        "hate": {
          "filtered": true,
          "severity": "safe"
        },
        "self_harm": {
          "filtered": true,
          "severity": "safe"
        },
        "sexual": {
          "filtered": true,
          "severity": "safe"
        },
        "violence": {
          "filtered": true,
          "severity": "safe"
        },
        "jailbreak": {
          "filtered": true,
          "detected": true
        },
        "protected_material_text": {
          "filtered": true,
          "detected": true
        },
        "protected_material_code": {
          "filtered": true,
          "detected": true
        }
      }
    }
  ],
  "prompt_filter_results": [
    {
      "prompt_index": 0,
      "content_filter_results": {
        "hate": {
          "filtered": true,
          "severity": "safe"
        },
        "self_harm": {
          "filtered": true,
          "severity": "safe"
        },
        "sexual": {
          "filtered": true,
          "severity": "safe"
        },
        "violence": {
          "filtered": true,
          "severity": "safe"
        },
        "jailbreak": {
          "filtered": true,
          "detected": true
        },
        "protected_material_text": {
          "filtered": true,
          "detected": true
        },
        "protected_material_code": {
          "filtered": true,
          "detected": true
        }
      }
    }
  ],
  "created": -9007199254740991,
  "model": "string",
  "system_fingerprint": "string",
  "object": "chat.completion",
  "usage": {
    "completion_tokens": 0,
    "completion_tokens_details": {
      "accepted_prediction_tokens": 0,
      "audio_tokens": 0,
      "reasoning_tokens": 0,
      "rejected_prediction_tokens": 0
    },
    "prompt_tokens": 0,
    "prompt_tokens_details": {
      "audio_tokens": 0,
      "cached_tokens": 0
    },
    "total_tokens": 0
  },
  "user_tier": "anonymous",
  "citations": [
    "string"
  ]
}

Success
Text Generation With Messages​

Generate text from an OpenAI-style messages array and return the assistant content directly.

Use /v1/chat/completions when you need the full OpenAI-compatible JSON response.
Body
application/json

    messages
    Type: array
    required
    audio
    Type: object
    frequency_penalty
    Type: number
    min:  
    -2
    max:  
    2 nullable
    function_call
        Type: stringenum
        values
            none
            auto
    functions
    Type: array object[] 1…128
    logit_bias
    Type: object nullable
    logprobs
    Type: boolean nullable
    max_tokens
    Type: integer
    min:  
    0
    max:  
    9007199254740991 nullable

    Integer numbers.
    modalities
    Type: array string[]enum
    values
        text
        audio
    model
    Type: string

    AI model for text generation. See /v1/models for full list.
    parallel_tool_calls
    Type: boolean
    presence_penalty
    Type: number
    min:  
    -2
    max:  
    2 nullable

Responses

    200

    Generated text response, audio bytes, JSON message object, or SSE when stream=true

    application/json

    application/json

    application/json

    application/json

    application/json

    application/json

Request Example for post/text

import http.client
import json

conn = http.client.HTTPSConnection("gen.pollinations.ai")

payload = json.dumps({
  "messages": [
    {
      "content": "",
      "role": "system",
      "name": "",
      "cache_control": {
        "type": "ephemeral"
      }
    }
  ],
  "model": "openai",
  "modalities": [
    "text"
  ],
  "audio": {
    "voice": "alloy",
    "format": "wav"
  },
  "frequency_penalty": 0,
  "repetition_penalty": 0,
  "logit_bias": None,
  "logprobs": False,
  "top_logprobs": 0,
  "max_tokens": 0,
  "presence_penalty": 0,
  "response_format": {
    "type": "text"
  },
  "seed": -1,
  "stop": "",
  "stream": False,
  "stream_options": {
    "include_usage": True
  },
  "thinking": {
    "type": "disabled",
    "budget_tokens": 1
  },
  "reasoning_effort": "none",
  "thinking_budget": 0,
  "temperature": 0,
  "top_p": 0,
  "tools": [
    {
      "type": "function",
      "function": {
        "description": "",
        "name": "",
        "parameters": {},
        "strict": False
      }
    }
  ],
  "tool_choice": "none",
  "parallel_tool_calls": True,
  "user": "",
  "function_call": "none",
  "functions": [
    {
      "description": "",
      "name": "",
      "parameters": {}
    }
  ]
})
headers = {
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_SECRET_TOKEN"
}

conn.request(
    "POST",
    "/text",
    body=payload,
    headers=headers,
)

response = conn.getresponse()
print(response.read().decode())

conn.close()

No Body

Generated text response, audio bytes, JSON message object, or SSE when stream=true
Simple Text Generation​

Generate text from a prompt via a simple GET request. Returns plain text.

This is a simplified alternative to the OpenAI-compatible /v1/chat/completions endpoint — ideal for quick prototyping or simple integrations.
Path Parameters

    prompt
    Type: string
    min length:  
    1
    required

    Text prompt for generation

Query Parameters

    model
    Type: stringenum

    Text model to use. See /v1/models or /text/models for the full list of available models.
    values
        openai
        openai-fast
        openai-large
        gpt-5.5
        qwen-coder
    seed
    Type: integer
    min:  
    -1
    max:  
    9007199254740991

    Seed for reproducible results. Use -1 for random.
    system
    Type: string

    System prompt to set the model's behavior and context. Acts as initial instructions before the user prompt.
    json
    Type: boolean

    When true, the model returns valid JSON. Useful for structured data extraction.
    temperature
    Type: number

    Controls randomness. Lower values (e.g. 0.2) produce more focused output, higher values (e.g. 1.5) produce more creative output. Range: 0.0 to 2.0.
    stream
    Type: boolean

    Stream the response as it's generated, using Server-Sent Events (SSE). Each chunk contains partial text.

Responses

    text/plain

    application/json

    application/json

    application/json

    application/json

    application/json

    application/json

Request Example for get/text/{prompt}

import http.client

conn = http.client.HTTPSConnection("gen.pollinations.ai")

headers = {
  "Authorization": "Bearer YOUR_SECRET_TOKEN"
}

conn.request(
    "GET",
    "/text/Write%20a%20haiku%20about%20coding?model=openai&seed=0&system=&json=false&temperature=1&stream=false",
    headers=headers,
)

response = conn.getresponse()
print(response.read().decode())

conn.close()

string

Generated text response
🖼️ Image Generation ​

Generate images from text prompts via a simple GET request. Returns JPEG or PNG.

https://gen.pollinations.ai/image/a%20cat%20in%20space?model=flux

Available models: kontext, nanobanana, nanobanana-2, nanobanana-pro, seedream5, seedream, seedream-pro, gptimage, gptimage-large, gpt-image-2, flux, zimage, wan-image, wan-image-pro, qwen-image, grok-imagine, grok-imagine-pro, klein, p-image, p-image-edit, nova-canvas
🖼️ Image Generation Operations

    get/image/{prompt}
    post/v1/images/generations
    post/v1/images/edits

Generate Image​

Generate an image from a text prompt. Returns JPEG or PNG.

Available models: kontext, nanobanana, nanobanana-2, nanobanana-pro, seedream5, seedream, seedream-pro, gptimage, gptimage-large, gpt-image-2, flux, zimage, wan-image, wan-image-pro, qwen-image, grok-imagine, grok-imagine-pro, klein, p-image, p-image-edit, nova-canvas. zimage is the default.

Browse all available models and their capabilities at /image/models.
Path Parameters

    prompt
    Type: string
    min length:  
    1
    required

    Text description of the image to generate

Query Parameters

    model
    Type: stringenum
    required

    Model to use. Image: flux, zimage, gptimage, kontext, seedream5, nanobanana, nanobanana-pro, klein. Video: veo, seedance, seedance-pro, wan, nova-reel. See /image/models for full list.
    values
        kontext
        nanobanana
        nanobanana-2
        nanobanana-pro
        seedream5
    width
    Type: integer
    min:  
    0
    max:  
    9007199254740991

    Width in pixels. For images, exact pixels. For video models, mapped to nearest resolution tier (480p/720p/1080p).
    height
    Type: integer
    min:  
    0
    max:  
    9007199254740991

    Height in pixels. For images, exact pixels. For video models, mapped to nearest resolution tier (480p/720p/1080p).
    seed
    Type: integer
    min:  
    -1
    max:  
    2147483647

    Seed for reproducible results. Use -1 for random. Supported by: flux, zimage, seedream, klein, seedance, nova-reel. Other models ignore this parameter.
    enhance
    Type: boolean

    Let AI improve your prompt for better results. Applied during prompt processing.
    negative_prompt
    Type: string

    What to avoid in the generated image. Only supported by flux and zimage — other models ignore this.
    safe
    Type: boolean

    Enable safety content filters
    quality
    Type: stringenum

    Image quality level. Only supported by gptimage, gptimage-large, and gpt-image-2.
    values
        low
        medium
        high
        hd
    image
    Type: string

    Reference image URL(s) for image editing or video generation. Separate multiple URLs with | or ,. Image models: Used for editing/style reference (kontext, gptimage, seedream, klein, nanobanana). Video models: First image = starting frame; second image = ending frame for interpolation (veo only).
    transparent
    Type: boolean

    Generate image with transparent background. Only supported by gptimage, gptimage-large, and gpt-image-2.
    duration
    Type: integer
    min:  
    1
    max:  
    120

    Video duration in seconds. Only applies to video models. veo: 4, 6, or 8s. seedance: 2-10s. wan: 2-15s. nova-reel: 6-120s (multiples of 6).
    aspectRatio
    Type: string

    Video aspect ratio (16:9 or 9:16). Only applies to video models. If not set, determined by width/height.
    audio
    Type: boolean

    Generate audio for the video. Only applies to video models. Note: wan generates audio regardless of this flag. For veo, set to true to enable audio.

Responses

    application/json

    application/json

    application/json

    application/json

    application/json

    application/json

Request Example for get/image/{prompt}

import http.client

conn = http.client.HTTPSConnection("gen.pollinations.ai")

headers = {
  "Authorization": "Bearer YOUR_SECRET_TOKEN"
}

conn.request(
    "GET",
    "/image/a%20beautiful%20sunset%20over%20mountains?model=zimage&width=1024&height=1024&seed=0&enhance=false&negative_prompt=worst%20quality%2C%20blurry&safe=false&quality=medium&image=&transparent=false&duration=1&aspectRatio=&audio=false",
    headers=headers,
)

response = conn.getresponse()
print(response.read().decode())

conn.close()

@filename

Success - Returns the generated image
Generate Image (OpenAI-compatible)​

OpenAI-compatible image generation endpoint.

Generate images from text prompts. Supports response_format: "url" (returns a pollinations.ai URL) or "b64_json" (returns base64-encoded image data, default).

Authentication: Include your API key as Authorization: Bearer YOUR_API_KEY.
Body·
application/json

    prompt
    Type: string
    min length:  
    1
    max length:  
    32000
    required

    A text description of the desired image(s)
    image

    Reference image URL(s) for image-to-image generation (Pollinations extension)
        Type: string

        Reference image URL(s) for image-to-image generation (Pollinations extension)
    model
    Type: string

    The model to use for image generation
    n
    Type: integer
    min:  
    1
    max:  
    1

    Number of images to generate (currently max 1)
    quality
    Type: stringenum

    Image quality. OpenAI 'standard'/'hd' mapped to Pollinations equivalents
    values
        standard
        hd
        low
        medium
        high
    response_format
    Type: stringenum

    Return format. "url" returns a pollinations.ai URL, "b64_json" returns base64-encoded image data
    values
        url
        b64_json
    size
    Type: string

    Image size as WIDTHxHEIGHT (e.g., 1024x1024, 512x512)
    user
    Type: string

    End-user identifier for abuse tracking

Responses

    application/json

    application/json

    application/json

    application/json

    application/json

    application/json

Request Example for post/v1/images/generations

import http.client
import json

conn = http.client.HTTPSConnection("gen.pollinations.ai")

payload = json.dumps({
  "prompt": "",
  "model": "flux",
  "n": 1,
  "size": "1024x1024",
  "quality": "medium",
  "response_format": "b64_json",
  "user": "",
  "image": ""
})
headers = {
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_SECRET_TOKEN"
}

conn.request(
    "POST",
    "/v1/images/generations",
    body=payload,
    headers=headers,
)

response = conn.getresponse()
print(response.read().decode())

conn.close()

{
  "created": -9007199254740991,
  "data": [
    {
      "url": "string",
      "b64_json": "string",
      "revised_prompt": "string"
    }
  ]
}

Success
Edit Image (OpenAI-compatible)​

OpenAI-compatible image editing endpoint.

Edit images using a text prompt and one or more source images. Accepts JSON with image URLs or multipart/form-data with file uploads.

Authentication: Include your API key as Authorization: Bearer YOUR_API_KEY.
Responses

    application/json

    application/json

    application/json

    application/json

    application/json

    application/json

Request Example for post/v1/images/edits

import http.client

conn = http.client.HTTPSConnection("gen.pollinations.ai")

headers = {
  "Authorization": "Bearer YOUR_SECRET_TOKEN"
}

conn.request(
    "POST",
    "/v1/images/edits",
    headers=headers,
)

response = conn.getresponse()
print(response.read().decode())

conn.close()

{
  "created": -9007199254740991,
  "data": [
    {
      "url": "string",
      "b64_json": "string",
      "revised_prompt": "string"
    }
  ]
}

Success
🎬 Video Generation ​

Generate videos from text prompts or reference images. Returns MP4.

https://gen.pollinations.ai/video/sunset%20timelapse?model=veo&duration=4

Available models: veo, seedance, seedance-pro, wan, wan-fast, grok-video-pro, ltx-2, p-video, nova-reel
🎬 Video Generation Operations

    get/video/{prompt}

Generate Video​

Generate a video from a text prompt. Returns MP4.

Available models: veo, seedance, seedance-pro, wan, wan-fast, grok-video-pro, ltx-2, p-video, nova-reel.

Use duration to set video length, aspectRatio for orientation, and audio to enable soundtrack generation.

You can also pass reference images via the image parameter — for example, veo supports start and end frames for interpolation.

Browse all available models at /image/models.
Path Parameters

    prompt
    Type: string
    min length:  
    1
    required

    Text description of the video to generate

Query Parameters

    model
    Type: stringenum
    required

    Model to use. Image: flux, zimage, gptimage, kontext, seedream5, nanobanana, nanobanana-pro, klein. Video: veo, seedance, seedance-pro, wan, nova-reel. See /image/models for full list.
    values
        kontext
        nanobanana
        nanobanana-2
        nanobanana-pro
        seedream5
    width
    Type: integer
    min:  
    0
    max:  
    9007199254740991

    Width in pixels. For images, exact pixels. For video models, mapped to nearest resolution tier (480p/720p/1080p).
    height
    Type: integer
    min:  
    0
    max:  
    9007199254740991

    Height in pixels. For images, exact pixels. For video models, mapped to nearest resolution tier (480p/720p/1080p).
    seed
    Type: integer
    min:  
    -1
    max:  
    2147483647

    Seed for reproducible results. Use -1 for random. Supported by: flux, zimage, seedream, klein, seedance, nova-reel. Other models ignore this parameter.
    enhance
    Type: boolean

    Let AI improve your prompt for better results. Applied during prompt processing.
    negative_prompt
    Type: string

    What to avoid in the generated image. Only supported by flux and zimage — other models ignore this.
    safe
    Type: boolean

    Enable safety content filters
    quality
    Type: stringenum

    Image quality level. Only supported by gptimage, gptimage-large, and gpt-image-2.
    values
        low
        medium
        high
        hd
    image
    Type: string

    Reference image URL(s) for image editing or video generation. Separate multiple URLs with | or ,. Image models: Used for editing/style reference (kontext, gptimage, seedream, klein, nanobanana). Video models: First image = starting frame; second image = ending frame for interpolation (veo only).
    transparent
    Type: boolean

    Generate image with transparent background. Only supported by gptimage, gptimage-large, and gpt-image-2.
    duration
    Type: integer
    min:  
    1
    max:  
    120

    Video duration in seconds. Only applies to video models. veo: 4, 6, or 8s. seedance: 2-10s. wan: 2-15s. nova-reel: 6-120s (multiples of 6).
    aspectRatio
    Type: string

    Video aspect ratio (16:9 or 9:16). Only applies to video models. If not set, determined by width/height.
    audio
    Type: boolean

    Generate audio for the video. Only applies to video models. Note: wan generates audio regardless of this flag. For veo, set to true to enable audio.

Responses

    video/mp4

    application/json

    application/json

    application/json

    application/json

    application/json

    application/json

Request Example for get/video/{prompt}

import http.client

conn = http.client.HTTPSConnection("gen.pollinations.ai")

headers = {
  "Authorization": "Bearer YOUR_SECRET_TOKEN"
}

conn.request(
    "GET",
    "/video/a%20sunset%20timelapse%20over%20the%20ocean?model=zimage&width=1024&height=1024&seed=0&enhance=false&negative_prompt=worst%20quality%2C%20blurry&safe=false&quality=medium&image=&transparent=false&duration=1&aspectRatio=&audio=false",
    headers=headers,
)

response = conn.getresponse()
print(response.read().decode())

conn.close()

@filename

Success - Returns the generated video
🔊 Audio Generation (Collapsed)​

Text-to-speech, music generation, and audio transcription.
Endpoint 	Description
GET /audio/{text} 	Simple URL-based TTS or music generation
POST /v1/audio/speech 	OpenAI-compatible TTS
POST /v1/audio/transcriptions 	Speech-to-text transcription

Audio models: elevenlabs, elevenmusic, whisper, scribe, universal-2, universal-3-pro, acestep, qwen-tts, qwen-tts-instruct

Available voices: alloy, echo, fable, onyx, nova, shimmer, ash, ballad, coral, sage, verse, rachel, domi, bella, elli, charlotte, dorothy, sarah, emily, lily, matilda, adam, antoni, arnold, josh, sam, daniel, charlie, james, fin, callum, liam, george, brian, bill
🔊 Audio Generation Operations

    post/v1/audio/speech
    post/v1/audio/transcriptions
    get/audio/{text}

🤖 Models (Collapsed)​

Discover available models with pricing, capabilities, and metadata. No authentication required.
Endpoint 	Returns
GET /v1/models 	Text models in OpenAI format ({object: "list", data: [...]})
GET /text/models 	Text models with pricing, context window, tool support
GET /image/models 	Image & video models with capabilities and pricing
GET /audio/models 	Audio models with supported voices
🤖 Models Operations

    get/v1/models
    get/models
    get/image/models
    get/text/models
    get/audio/models

👤 Account (Collapsed)​

Manage your account, check your pollen balance, and view usage history. All endpoints require authentication.
Endpoint 	Description
GET /account/profile 	GitHub username and profile image
GET /account/balance 	Current pollen balance
GET /account/usage 	Per-request history with costs
GET /account/usage/daily 	Daily aggregated usage for dashboards
GET /account/key 	API key validity, type, and permissions

When using API keys, specific permissions may be required, such as account:usage or account:profile.
👤 Account Operations

    get/account/profile
    get/account/balance
    get/account/usage
    get/account/usage/daily
    get/account/keys
    post/account/keys
    delete/account/keys/{id}
    get/account/key
    get/account/key/usage

📦 Media Storage (Collapsed)​

Content-addressed media storage. Upload and retrieve images, audio, and video by content hash.
Endpoint 	Description
POST /upload 	Upload a file, receive a content-addressed URL
GET /{hash} 	Retrieve a previously uploaded file
GET /{hash}/metadata 	Get file metadata as JSON

Base URL: https://media.pollinations.ai
📦 Media Storage Operations

    post/upload
    get/{hash}
    head/{hash}
    delete/{hash}

🌸 Bring Your Own Pollen (Collapsed)​
🌼 Bring Your Own Pollen (BYOP)

Your users pay for their own AI usage. You pay $0.
🔄 How It Works

    User connects — via your web app or CLI
    Signs in, creates a scoped API key
    Their pollen, your app

Why this is good:

    💸 $0 costs — scales to any number of users without costing you a cent
    🔑 No key management — the auth flow handles it
    ⚖️ Self-regulating — everyone pays for what they use
    🌐 Works everywhere — web apps, CLIs, MCP servers, anything

Both flows land on the same authorize screen where users set model restrictions, budget, and expiry. Same key, same pollen, different entry point.
🗝️ App Key

An App Key is a publishable key (pk_...) you create on enter.pollinations.ai specifically for BYOP. It's optional but strongly recommended:
Without App Key 	With App Key
Consent screen shows generic hostname 	Consent screen shows your app name + your GitHub
No traffic attribution 	Traffic your app drives is tracked to your account
No tier benefit 	Real usage → automatic tier upgrades → higher pollen grants

To create one, go to enter.pollinations.ai → Create New App Key:

Create New App Key

Set the Name (shows on the consent screen) and at least one Redirect URI (your exact callback URL). The key you get back is your client_id (a pk_... publishable key; the legacy name app_key is still accepted).

When users authorize, this is what they see:

Authorize Screen
⚙️ Web Apps (Redirect Flow)
1. Build the Auth Link

With client_id (consent screen shows your app name + your GitHub):

https://enter.pollinations.ai/authorize?redirect_uri=https://myapp.com&client_id=pk_yourkey

Without (still works, just shows the hostname):

https://enter.pollinations.ai/authorize?redirect_uri=https://myapp.com

With restrictions:

https://enter.pollinations.ai/authorize?redirect_uri=https://myapp.com&client_id=pk_yourkey&scope=usage&models=flux,openai&expiry=7&budget=10

Param 	What it does 	Example
client_id 	Your publishable key — shows app name + author on consent screen, tracks traffic for tier upgrades 	pk_abc123
redirect_uri 	Where users return after authorizing — receives the temp API key in the URL fragment 	https://myapp.com
state 	Opaque value echoed back on the callback for CSRF protection 	any-random-string
scope 	Account access (space or comma separated) 	usage keys
models 	Restrict to specific models 	flux,openai,gptimage
budget 	Numeric Pollen cap. Defaults to 5; users can clear the budget field on the consent screen for unlimited. 	10
expiry 	Key lifetime in days (default: 30) 	7

Legacy names app_key, redirect_url, and permissions are still accepted for backwards compatibility.
2. Handle the Redirect

User comes back with a key in the URL fragment:

https://myapp.com#api_key=sk_abc123xyz

Fragment, not query param — never hits server logs. 🔒 If you passed state, it's echoed back: #api_key=sk_...&state=.... On denial the fragment is #error=access_denied&state=....
💻 Code

// Send user to auth
const params = new URLSearchParams({
  redirect_uri: location.href,
  client_id: 'pk_yourkey', // optional — shows app name + author
});
window.location.href = `https://enter.pollinations.ai/authorize?${params}`;

// Grab key from URL after redirect
const apiKey = new URLSearchParams(location.hash.slice(1)).get('api_key');

// Use their pollen
fetch('https://gen.pollinations.ai/v1/chat/completions', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ model: 'openai', messages: [{ role: 'user', content: 'yo' }] })
});

🖥️ CLIs & Headless Apps (Device Flow)

Same authorize screen, but the user opens a browser separately. Your CLI polls for the key.

Where this fits:

    Discord / Telegram / WhatsApp bots — bot DMs the code, user approves in browser, bot gets their key
    CLI tools — pollinations login opens a browser, CLI waits for approval
    MCP servers — AI agent requests access, user approves from their browser
    Raspberry Pi / IoT — headless device displays a code, user approves on their phone
    VS Code extensions — extension shows the code, user approves in browser

# 1. request a device code (pass your app_key as client_id for attribution)
curl -X POST https://enter.pollinations.ai/api/device/code \
  -H 'Content-Type: application/json' \
  -d '{"client_id": "pk_yourkey", "scope": "generate"}'
# → { "device_code": "...", "user_code": "ABCD-1234", "verification_uri": "/device" }

# 2. tell user: "go to enter.pollinations.ai/device and enter ABCD-1234"

# 3. poll for the key (every 5s)
curl -X POST https://enter.pollinations.ai/api/device/token \
  -H 'Content-Type: application/json' \
  -d '{"device_code": "..."}'
# pending → { "error": "authorization_pending" }
# done    → { "access_token": "sk_...", "token_type": "bearer", "scope": "generate" }

👤 Who's Using This Key?

Once you have a key, you can check who it belongs to:

curl https://enter.pollinations.ai/api/device/userinfo \
  -H 'Authorization: Bearer sk_...'
# → { "sub": "user-id", "name": "Thomas", "preferred_username": "voodoohop", "email": "...", "picture": "..." }

Standard OIDC userinfo shape — works with any sk_ or pk_ key.

🕐 Keys expire in 30 days. Users can revoke anytime from the dashboard.

edit this doc · h/t Puter.js for the idea

	
	
	
	
	
	
	
	
	
	
	
	
	
	

