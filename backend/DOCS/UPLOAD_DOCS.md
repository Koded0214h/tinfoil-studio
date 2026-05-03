
Skip to main content
Upload Post Logo
Upload-Post
Documentation
App
OpenAPI
llm.txt
GitHub
⌘
K

    Upload-Post API
    Introduction
    Getting Started
    API Reference
        API Reference
        Uploads
            Upload Text
            Upload Photos
            Upload Video
            Upload Document
            Upload Status
            Upload History
            Webhooks
        Manage Scheduled Posts
        Queue System
        FFmpeg Editor API
        Requirements
        Profiles & Analytics
        Social Interactions
        Platform Specifics
        SDK Examples
    Guides
    Resources

    API ReferenceUploadsUpload Video

Upload Video

Upload video to various social media platforms using this endpoint.
Endpoint

POST /api/upload

Headers
Name	Value	Description
Authorization	Apikey your-api-key-here	Your API key for authentication
Idempotency-Key	unique-string	Optional. Prevents duplicate uploads if the same request is retried (e.g., after a timeout). Can also be sent as X-Idempotency-Key or X-Request-Id. When provided, if a matching upload job already exists, the API returns the existing job instead of creating a duplicate.
Common Parameters
Name	Type	Required	Description
user	String	Yes	User identifier
platform[]	Array	Yes	Platform(s) to upload to (e.g., "tiktok", "instagram", "linkedin", "youtube", "facebook", "twitter", "threads", "pinterest", "bluesky", "reddit", "google_business")
video	File	Yes	The video file to upload (can be a file upload or a video URL)
title	String	Conditional	Default title of the video. Required for YouTube and Reddit. Optional for all other platforms (TikTok, Instagram, Facebook, LinkedIn, X, Threads, Bluesky, Pinterest).
description	String	No	Optional extended text used only on LinkedIn commentary, Facebook descriptions, YouTube descriptions, and Pinterest notes. Ignored elsewhere.
scheduled_date	String (ISO-8601)	No	Optional date/time (ISO-8601) to schedule publishing, e.g., "2024-12-31T23:45:00Z". Must be in the future (≤ 365 days). Omit for immediate upload.
timezone	String (IANA)	No	Optional timezone identifier (e.g., "Europe/Madrid", "America/New_York"). If provided, scheduled_date is interpreted in this timezone. Defaults to UTC if omitted. See IANA Time Zone Database for valid values.
request_id	String	No	Client-provided request identifier. If omitted, the server generates one. Returned in every response and used to track the upload via Upload Status. Useful when async_upload=true and the HTTP response might be lost (e.g., timeout). Can also be sent as an X-Request-Id header.
async_upload	Boolean	No	If true, the request returns immediately with a request_id and processes in the background. See Upload Status.
add_to_queue	Boolean	No	If true, automatically schedules the post to your next available queue slot. Cannot be used with scheduled_date. See Queue System.
max_posts_per_slot	Integer	No	Override the profile's max posts per slot setting for this request. Only used when add_to_queue=true. See Queue System.
first_comment	String	No	Automatically post a first comment after publishing. Supported on Instagram, Facebook, Threads, Bluesky, Reddit, X, YouTube, and LinkedIn. On X (Twitter) and Threads, this creates a reply to the main post. For X threads, the comment is posted as a reply to the last tweet in the thread. On YouTube, it posts as a top-level comment on the video.
first_comment_media[]	File(s)	No	Image files to attach to the first comment as inline images. Currently supported on Reddit. Not available for scheduled or queued posts.

    Important: If you set async_upload to false but the upload takes longer than 59 seconds, it will automatically switch to asynchronous processing to avoid timeouts. In that case, use the request_id with the Upload Status endpoint to check the upload status and result.

    Scheduling behavior: When you provide scheduled_date, the API responds with 202 Accepted and includes a job_id. That same job_id will later appear in Upload History so you can correlate the scheduled job with the eventual publish record. You can also use the job_id with the Upload Status endpoint to check the execution status of the scheduled post.

Platform-Specific First Comments

The first_comment parameter serves as a fallback. To set a custom first comment for a particular platform, use the optional [platform]_first_comment parameter. If provided, it will override the main first_comment for that platform.

Example Optional Parameters:

    instagram_first_comment: "Follow for more content! #photography"
    facebook_first_comment: "Let me know your thoughts in the comments!"
    x_first_comment: "Thread incoming! 🧵"
    threads_first_comment: "First comment on Threads!"
    youtube_first_comment: "Subscribe for more videos!"
    reddit_first_comment: "Source in the comments."
    bluesky_first_comment: "More details in the replies."
    linkedin_first_comment: "Source article in the comments."

Platform-Specific Titles

The title parameter serves as a fallback. To set a custom title for a particular platform, use the optional [platform]_title parameter. If provided, it will override the main title for that platform.

Example Optional Parameters:

    instagram_title: "Check out my latest reel on Instagram! #reels"
    facebook_title: "Excited to share this new video with my Facebook friends and family."
    tiktok_title: "New TikTok video just dropped! 🔥"
    linkedin_title: "A professional insight on the latest industry trends, discussed in this video."
    x_title: "New video out now! 📢"
    youtube_title: "My new YouTube video is live!"
    pinterest_title: "An inspiring video pin."
    reddit_title: "Check out this video!"

Platform-Specific Parameters
TikTok

For more information about Tiktok API parameters, visit the Tiktok API documentation.
Name	Type	Required	Description	Default
tiktok_title	String	No	Specific title for the TikTok post (max 90 characters for photo posts, 2200 for video). Fallbacks to title.	title
privacy_level	String	No	Privacy setting ("PUBLIC_TO_EVERYONE", "MUTUAL_FOLLOW_FRIENDS", "FOLLOWER_OF_CREATOR", "SELF_ONLY")	"PUBLIC_TO_EVERYONE"
disable_duet	Boolean	No	Disable duet feature	false
disable_comment	Boolean	No	Disable comments	false
disable_stitch	Boolean	No	Disable stitch feature	false
post_mode	String	No	DIRECT_POST: Directly post the content to TikTok user's account or MEDIA_UPLOAD: Upload content to TikTok for users to complete the post using TikTok's editing flow. Users will receive an inbox notification.	DIRECT_POST
cover_timestamp	Integer	No	Timestamp in milliseconds for video cover	1000
brand_content_toggle	Boolean	No	Set to true for paid partnerships that promote third-party brands.	false
brand_organic_toggle	Boolean	No	Set to true when promoting the creator's own business.	false
is_aigc	Boolean	No	Indicates if content is AI-generated	false

    Note on Draft Mode (MEDIA_UPLOAD): When using MEDIA_UPLOAD mode (Draft), TikTok does not allow setting a title, caption, privacy settings, or other metadata via the API. The video is simply uploaded to your TikTok inbox/drafts, and you must add the title, caption, and settings manually within the TikTok app before publishing.

The global description field is ignored for TikTok uploads.
Instagram

For more information about Instagram API parameters, visit the Instagram Graph API documentation.
Name	Type	Required	Description	Default
instagram_title	String	No	Specific title for the Instagram post. Fallbacks to title.	title
media_type	String	No	Type of media ("REELS" or "STORIES")	"REELS"
share_mode	String	No	Reel posting mode. See Trial Reels below for details.	"CUSTOM"
share_to_feed	Boolean	No	Whether to share to feed (only for regular Reels, not Trial Reels)	true
collaborators	String	No	Comma-separated list of collaborator usernames (not available for Trial Reels)	-
cover_url	String	No	URL for custom video cover. You can also send a binary image via the cover_image field (see below).	-
cover_image	File	No	Binary cover image file (JPEG, ≤ 8MB). Uploaded to a public URL automatically. If both cover_image and cover_url are provided, cover_url takes precedence.	-
audio_name	String	No	Name of the audio track embedded in your video	-
user_tags	String	No	Comma-separated list of user tags	-
location_id	String	No	Instagram location ID	-
thumb_offset	String	No	Timestamp offset for video thumbnail, expressed in milliseconds	-
Trial Reels (share_mode)

Trial Reels allow you to test content with non-followers first to see how it performs before sharing with your followers. This feature is available for public Instagram accounts with at least 1,000 followers.

Available share_mode values:
Value	Description
CUSTOM	Regular Reel (default) - Shown to all followers immediately
TRIAL_REELS_SHARE_TO_FOLLOWERS_IF_LIKED	Trial Reel with auto-share - Shown to non-followers first. If it performs well within 72 hours, Instagram automatically shares it with your followers
TRIAL_REELS_DONT_SHARE_TO_FOLLOWERS	Trial Reel without auto-share - Shown only to non-followers. You decide later in the Instagram app if you want to share with followers

Important notes about Trial Reels:

    Only you can see that a Reel is marked as a Trial. To everyone else, it appears as a regular Reel.
    Your followers won't see the Trial on your profile or in their feeds unless you (or Instagram, if auto-share is enabled) choose to share it.
    Collaborators cannot be added to Trial Reels.
    There may be limits on how many Trial Reels you can publish within a certain period.

Note on Instagram audio_name

    Scope: Reels only, and only for the original audio embedded in your uploaded video. It does not let you pick licensed/trending music from Instagram’s library via API.
    Limit: You can rename only once (when creating the Reel via API, or later from the audio page if you are the audio owner).
    Behavior: The Reel is published using the audio embedded in your video and displays the name you provide in audio_name.

The global description field is ignored for Instagram video uploads.
LinkedIn

For more information about LinkedIn API parameters, visit the LinkedIn Marketing API documentation.
Name	Type	Required	Description	Default
linkedin_title	String	No	Specific title for the LinkedIn post. Fallbacks to title.	title
linkedin_description or description	String	No	Sent as the LinkedIn commentary. If omitted, we reuse title.	title
visibility	String	Yes	Visibility setting ("CONNECTIONS", "PUBLIC", "LOGGED_IN", "CONTAINER")	"PUBLIC"
target_linkedin_page_id	String	No	LinkedIn page ID to upload videos to an organization	"107579166"
YouTube

For more information about YouTube API parameters, visit the YouTube Data API documentation.
Name	Type	Required	Description	Default
youtube_title	String	No	Specific title for the YouTube video. Fallbacks to title.	title
youtube_description or description	String	No	Populates snippet.description. If omitted, we send title.	title
tags	Array	No	Array of tags	[]
categoryId	String	No	Video category	"22"
privacyStatus	String	No	Privacy setting ("public", "unlisted", "private")	"public"
embeddable	Boolean	No	Whether video is embeddable	true
license	String	No	Video license ("youtube", "creativeCommon")	"youtube"
publicStatsViewable	Boolean	No	Whether public stats are viewable	true
thumbnail	File	No	Custom thumbnail image to set after upload. Accepts a multipart image file or a public URL. Formats: JPG/PNG/GIF/BMP. Max 2 MB. If both thumbnail (file) and thumbnail_url are provided, the file takes precedence. YouTube custom thumbnails are not supported for Shorts; they only apply to standard YouTube videos.	-
thumbnail_url	String (URL)	No	Alternative to provide the thumbnail as a public URL.	-
selfDeclaredMadeForKids	Boolean	No	Explicit declaration that the video is made for children	false
containsSyntheticMedia	Boolean	No	Declaration that the video contains synthetic or AI-generated content	false
defaultLanguage	String	No	Language of title and description (BCP-47 code, e.g., "es", "en")	-
defaultAudioLanguage	String	No	Language of the video audio (BCP-47 code, e.g., "es-ES", "en-US")	-
allowedCountries	String	No	Comma-separated list of country codes where the video is allowed (e.g., "US,CA,MX")	-
blockedCountries	String	No	Comma-separated list of country codes where the video is blocked (e.g., "CN,RU")	-
hasPaidProductPlacement	Boolean	No	Declaration that the video includes paid product placements	false
recordingDate	String	No	Recording date and time of the video (ISO 8601 format, e.g., "2024-01-15T14:30:00Z")	-

    Important: YouTube custom thumbnails are not supported for Shorts; they only apply to standard YouTube videos.

Notes about new YouTube parameters:

    Region restrictions: allowedCountries and blockedCountries cannot be used simultaneously. Country codes must be ISO 3166-1 alpha-2 (e.g., "US", "CA", "MX").
    Language settings: defaultLanguage affects title and description display, while defaultAudioLanguage specifies the spoken language in the video. Use BCP-47 codes (e.g., "es" for Spanish, "es-ES" for Spain Spanish).
    Legal declarations: selfDeclaredMadeForKids is used for COPPA compliance. containsSyntheticMedia provides transparency for AI-generated content. hasPaidProductPlacement ensures FTC compliance.

Facebook

For more information about Facebook API parameters, visit the Facebook Graph API documentation and the Facebook Video API Publishing Guide.
Name	Type	Required	Description	Default
facebook_title	String	No	Specific title for the Facebook post. Fallbacks to title. Note: If facebook_media_type is "STORIES", this field is ignored.	title
facebook_description or description	String	No	Sent as description for the video. Note: If facebook_media_type is "STORIES", this field is ignored.	title
facebook_page_id	String	Yes	Facebook Page ID where the video will be posted	-
facebook_media_type	String	No	Type of media: "REELS" (short-form 9:16), "STORIES" (24h ephemeral), or "VIDEO" (normal page video, any aspect ratio, up to 4 hours)	"REELS"
video_state	String	No	Desired state of the video ("DRAFT", "PUBLISHED")	"PUBLISHED"
thumbnail_url	String	No	Public URL of an image to set as the video thumbnail. Only supported when facebook_media_type is "VIDEO". Uses the Facebook Video Thumbnails API.	-

    Normal page videos (VIDEO): Use facebook_media_type=VIDEO to upload regular videos to a Facebook Page (not Reels or Stories). These videos have no forced 9:16 aspect ratio, support durations up to 4 hours, and support custom thumbnails via the thumbnail_url parameter.

    Note: If facebook_page_id is not provided, we will automatically use the user's only connected Page (if exactly one exists). If multiple Pages are connected, the API returns a helpful error with an available_pages list so you can choose one. Posting to personal Facebook profiles via API is not supported by Meta; only Pages can be posted to.

Threads

For more information about Threads API parameters, visit the Threads API documentation.
Name	Type	Required	Description	Default
threads_title	String	No	Specific title for the Threads post. Fallbacks to title.	title
threads_topic_tag	String	No	A topic tag for the post (1-50 characters). Cannot contain periods (.) or ampersands (&). One tag per post. Helps increase reach.	-

The global description field is ignored for Threads video uploads.
X (Twitter)

For more information about X API parameters, visit the X API Post Creation documentation.
Name	Type	Required	Description	Default
x_title	String	No	Specific title for the tweet. Fallbacks to title.	title
x_long_text_as_post	Boolean	No	When true, publishes long text as a single post. Otherwise, creates a thread.	false
reply_settings	String	No	Controls who can reply to the tweet ("following", "mentionedUsers", "subscribers", "verified")	-
geo_place_id	String	No	Place ID for adding geographic location to the tweet	-
nullcast	Boolean	No	Whether to publish without broadcasting (promotional/promoted-only posts)	false
for_super_followers_only	Boolean	No	Tweet exclusive for super followers	false
community_id	String	No	Community ID for posting to specific communities	-
share_with_followers	Boolean	No	Share community post with followers	false
direct_message_deep_link	String	No	Link to take the conversation from public timeline to private Direct Message	-
tagged_user_ids	Array	No	Array of user IDs to tag in the media (max 10 users)	[]
reply_to_id	String	No	ID of the tweet to reply to. Creates a reply to the specified tweet.	-
exclude_reply_user_ids	Array	No	Array of user IDs to exclude from replying to this tweet. Requires reply_to_id.	[]

The global description field is ignored for X uploads.
How X (Twitter) Thread Creation Works (Advanced Logic)

Note: The following describes the default thread creation logic. To override this and post long text as a single post, set the x_long_text_as_post parameter to true.

The system is engineered to create well-formatted, natural-looking threads on X (formerly Twitter). Instead of simply splitting text at every line break, it intelligently groups paragraphs to create more readable tweets.

Here's the step-by-step logic:

Intelligent Paragraph Grouping (Primary Method):

The function first identifies distinct paragraphs (any text separated by a blank line). It then combines as many of these paragraphs as possible into a single tweet, filling it up to the 280-character limit without exceeding it. The double newline (\n\n) between combined paragraphs is preserved for formatting. This results in fewer, more substantial tweets that flow naturally, just as if a person had written them.

Handling Exceptionally Long Paragraphs:

If a single paragraph is, by itself, longer than the 280-character limit, a more granular splitting logic is automatically triggered for that paragraph only:

    Split by Line Break: The system first attempts to break the paragraph down by its individual line breaks (\n).
    Split by Word: If any of those single lines are still too long, it will split them by words as a final resort.

Media Attachment:

For posts that include photos or videos, all media is attached only to the first tweet of the thread. The subsequent tweets in the thread will be text-only replies.
Pinterest
Name	Type	Required	Description	Default
pinterest_title	String	No	Specific title for the Pinterest Pin. Fallbacks to title.	title
pinterest_description or description	String	No	Populates pin.description. If omitted, we reuse title.	title
pinterest_board_id	String	Yes	Pinterest board ID to publish the video to.	-
pinterest_alt_text	String	No	Alt text for the video.	-
pinterest_link	String	No	Destination link for the video Pin.	-
pinterest_cover_image_url	String	No	URL of an image to use as the video cover.	-
pinterest_cover_image_content_type	String	No	Content type of the cover image (e.g., image/jpeg, image/png), used if pinterest_cover_image_data is provided.	-
pinterest_cover_image_data	String	No	Base64 encoded cover image data, used if pinterest_cover_image_content_type is provided.	-
pinterest_cover_image_key_frame_time	Integer	No	Time in milliseconds of the video frame to use as cover.	-
Bluesky
Name	Type	Required	Description	Default
bluesky_title	String	No	Specific text for the Bluesky video post. Fallbacks to title.	title

Note: Video uploads to Bluesky are limited to 10GB per day/user and 25 videos per day, 100MBs Maximum, and up to 3 minutes (180 seconds) in duration. Supported formats: .mp4, .mpeg, .webm, .mov.
Reddit
Name	Type	Required	Description	Default
reddit_title	String	No	Specific title for the Reddit post. Fallbacks to title.	title
subreddit	String	Yes	Name of the subreddit to post to (without "r/").	-
flair_id	String	No	ID of the flair to apply to the post.	-
Google Business Profile
Name	Type	Required	Description	Default
gbp_location_id	String	No*	The location to post to. Use Get Google Business Locations to list available locations.	Auto
gbp_topic_type	String	No	Post type: STANDARD (default), EVENT, or OFFER.	STANDARD
gbp_cta_type	String	No	Call-to-action button: BOOK, ORDER, SHOP, LEARN_MORE, SIGN_UP, CALL.	-
gbp_cta_url	String	Conditional	URL for the CTA button. Required if gbp_cta_type is set.	-

    Note: If gbp_location_id is not provided, the API will automatically use the account's only location (if exactly one exists). If multiple locations are connected, the API returns an error asking you to select one.

Event parameters (when gbp_topic_type is EVENT):
Name	Type	Required	Description
gbp_event_title	String	Yes	Title of the event.
gbp_event_start_date	String	Yes	Start date in YYYY-MM-DD format.
gbp_event_start_time	String	No	Start time in HH:MM format (24h).
gbp_event_end_date	String	Yes	End date in YYYY-MM-DD format.
gbp_event_end_time	String	No	End time in HH:MM format (24h).

Offer parameters (when gbp_topic_type is OFFER):
Name	Type	Required	Description
gbp_coupon_code	String	No	Coupon or promo code.
gbp_redeem_url	String	No	URL where the offer can be redeemed.
gbp_terms	String	No	Terms and conditions of the offer.
Example Requests
Upload a Video to TikTok

curl \
  -H 'Authorization: Apikey your-api-key-here' \
  -F 'video=@/path/to/your/video.mp4' \
  -F 'title="Your Video Title"' \
  -F 'user="test"' \
  -F 'platform[]=tiktok' \
  -X POST https://api.upload-post.com/api/upload

Upload a Video to YouTube Using URL

curl \
  -H 'Authorization: Apikey your-api-key-here' \
  -F 'video="https://example.com/videos/myvideo.mp4"' \
  -F 'title="Your Video Title"' \
  -F 'description="Your video description"' \
  -F 'user="test"' \
  -F 'platform[]=youtube' \
  -F 'tags[]=tutorial' \
  -F 'tags[]=howto' \
  -F 'categoryId="22"' \
  -X POST https://api.upload-post.com/api/upload

Upload a Video to YouTube With Custom Thumbnail

curl \
  -H 'Authorization: Apikey your-api-key-here' \
  -F 'video=@/path/to/your/video.mp4' \
  -F 'title="Your Video Title"' \
  -F 'description="Your video description"' \
  -F 'user="test"' \
  -F 'platform[]=youtube' \
  -F 'thumbnail_url="https://example.com/images/thumbnail-1280x720.jpg"' \
  -X POST https://api.upload-post.com/api/upload

Upload to YouTube with thumbnail file

curl -X POST https://api.upload-post.com/api/upload \
  -H "Authorization: Apikey <API_KEY>" \
  -F "user=<profile_username>" \
  -F "platform[]=youtube" \
  -F "title=Demo video" \
  -F "description=Description" \
  -F "video=@/path/video.mp4;type=video/mp4" \
  -F "thumbnail=@/path/thumbnail.jpg;type=image/jpeg"

Responses

    200 OK (synchronous, finished fast)

{
  "success": true,
  "results": {
    "instagram": {
      "success": true,
      "url": "https://instagram.com/p/...",
      "container_id": "1789...",
      "video_was_transcoded": true,
      "changes": {},
      "prevalidation_metadata": {}
    },
    "linkedin": {
      "success": false,
      "error": "Expired access token"
    }
  },
  "usage": {
    "count": 12,
    "limit": 100,
    "last_reset": "2025-09-01T10:00:00.000Z"
  }
}

    200 OK (asynchronous/background started, including sync→background fallback)

{
  "success": true,
  "message": "Upload initiated successfully in background.",
  "request_id": "1a2b3c4d5e...",
  "total_platforms": 3
}

    202 Accepted (scheduled)

{
  "success": true,
  "job_id": "scheduler_job_123",
  "scheduled_date": "2025-09-22T10:00:00Z"
}

    400 Bad Request
        Missing user, platform[], video file/URL, invalid scheduled_date, invalid platform values, Pinterest without pinterest_board_id.

{ "success": false, "message": "Username required in form data" }

    401 Unauthorized

{ "success": false, "message": "Invalid or expired token" }

    403 Forbidden (e.g., TikTok on Free plan)

{ "success": false, "message": "TikTok uploads are not available on the Free plan. Please upgrade to a paid plan." }

    404 Not Found (e.g., user not found after auth)

{ "success": false, "message": "User not found" }

    429 Too Many Requests (monthly limit exceeded; includes current usage)

{
  "success": false,
  "message": "This upload would exceed your monthly limit.",
  "usage": { "count": 10, "limit": 10, "last_reset": "..." }
}

    500 Internal Server Error

{ "success": false, "error": "Detailed error message" }

Notes

    When async or when sync falls back to background, use GET /api/uploadposts/status?request_id={request_id} to poll progress.
    Per-platform results may include: url, publish_id, container_id, post_id, video_urn, video_reel_id, video_id, image_urns, post_ids, video_was_transcoded, changes, prevalidation_metadata, or error.

Previous
Upload Photos
Next
Upload Document

    Endpoint
    Headers
    Common Parameters
    Platform-Specific First Comments
    Platform-Specific Titles
    Platform-Specific Parameters
    TikTok
    Instagram
    LinkedIn
    YouTube
    Facebook
    Threads
    X (Twitter)
    Pinterest
    Bluesky
    Reddit
    Google Business Profile
    Example Requests
    Upload a Video to TikTok
    Upload a Video to YouTube Using URL
    Upload a Video to YouTube With Custom Thumbnail
    Upload to YouTube with thumbnail file
    Responses

Documentation

    Getting Started
    API Reference
    Quickstart
    OpenAPI Spec

Community

    X (Twitter)
    GitHub

More

    Pricing
    Contact

Copyright © 2026 Upload Post, Inc. Built with Docusaurus.
