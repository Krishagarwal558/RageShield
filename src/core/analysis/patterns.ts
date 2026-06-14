import type { CategoryId, EmotionalToneKey, PersuasionTechniqueKey } from "~core/types"

export interface RulePattern<TKey extends string> {
  key: TKey
  label: string
  pattern: RegExp
  score: number
  explanation: string
}

export const TECHNIQUE_PATTERNS: Array<RulePattern<PersuasionTechniqueKey>> = [
  {
    key: "fearAppeal",
    label: "Fear appeal",
    pattern: /\b(before it'?s too late|your future is doomed|dangerous|threat|disaster|wake up|you should be scared|terrifying truth)\b/i,
    score: 28,
    explanation: "Uses threat or danger framing to increase urgency."
  },
  {
    key: "usVsThem",
    label: "Us vs Them",
    pattern: /\b(they are destroying|these people|their agenda|our way of life|us against them|the elites|the media wants)\b/i,
    score: 24,
    explanation: "Frames a group conflict in a way that pressures identity alignment."
  },
  {
    key: "certaintyLanguage",
    label: "Certainty language",
    pattern: /\b(everyone knows|nobody can deny|the truth is|undeniable|proven fact|always|never|no one talks about)\b/i,
    score: 22,
    explanation: "Signals high certainty instead of inviting evaluation."
  },
  {
    key: "engagementBait",
    label: "Engagement bait",
    pattern: /\b(comment if you agree|share before|like and subscribe|this will be deleted|watch until the end|you won'?t believe)\b/i,
    score: 24,
    explanation: "Asks for reactions or shares as part of the persuasive hook."
  },
  {
    key: "mockery",
    label: "Mockery",
    pattern: /\b(lol|clown|pathetic|look how stupid|humiliated|destroyed|owned|meltdown)\b/i,
    score: 20,
    explanation: "Uses ridicule to shape the viewer's response."
  },
  {
    key: "personalAttack",
    label: "Personal attack",
    pattern: /\b(idiot|moron|braindead|only fools|only idiots|delusional|trash person|scumbag)\b/i,
    score: 30,
    explanation: "Targets a person or group rather than the claim."
  },
  {
    key: "exaggeration",
    label: "Exaggeration",
    pattern: /\b(changes everything|destroyed the industry|biggest ever|insane|explosive|shocking|unbelievable|ultimate)\b/i,
    score: 20,
    explanation: "Amplifies stakes through extreme wording."
  },
  {
    key: "urgency",
    label: "Urgency",
    pattern: /\b(right now|act now|urgent|before midnight|last chance|do this now|immediately)\b/i,
    score: 22,
    explanation: "Creates pressure to react quickly."
  },
  {
    key: "fomo",
    label: "FOMO tactics",
    pattern: /\b(missing out|everyone is getting|don'?t miss|limited spots|only today|join before|you are late|while you still can)\b/i,
    score: 24,
    explanation: "Uses fear of missing out to push a reaction."
  },
  {
    key: "guiltPersuasion",
    label: "Guilt-based persuasion",
    pattern: /\b(if you care|real ones know|you should be ashamed|how can you ignore|silence is complicity|prove you care)\b/i,
    score: 26,
    explanation: "Uses guilt or moral pressure to force agreement."
  },
  {
    key: "victimhoodFraming",
    label: "Victimhood framing",
    pattern: /\b(they are silencing us|we are under attack|everyone is against us|persecuted for telling the truth|treated like criminals)\b/i,
    score: 25,
    explanation: "Frames a group as uniquely victimized to increase identity pressure."
  },
  {
    key: "conspiracyFraming",
    label: "Conspiracy framing",
    pattern: /\b(cover[- ]?up|secret agenda|hidden truth|they don'?t want you to know|mainstream media lies|do your own research)\b/i,
    score: 30,
    explanation: "Uses hidden-plot framing without direct evidence."
  },
  {
    key: "adHominem",
    label: "Ad hominem",
    pattern: /\b(he is a fraud|she is a fraud|what a clown|this idiot|these idiots|only morons think|brainwashed fool)\b/i,
    score: 30,
    explanation: "Attacks a person or group instead of the claim."
  },
  {
    key: "strawman",
    label: "Strawman",
    pattern: /\b(so you think|they want to ban everything|they hate freedom|apparently we should all|their whole argument is)\b/i,
    score: 22,
    explanation: "May replace an opposing claim with an easier version to attack."
  },
  {
    key: "falseDilemma",
    label: "False dilemma",
    pattern: /\b(either you are with us or against us|only two choices|there is no middle ground|pick a side|you either support this or)\b/i,
    score: 26,
    explanation: "Presents a complex issue as if only two choices exist."
  },
  {
    key: "bandwagon",
    label: "Bandwagon effect",
    pattern: /\b(everyone is switching|millions already|everyone is talking about|the whole internet agrees|all smart people know)\b/i,
    score: 20,
    explanation: "Uses popularity as a shortcut for truth or value."
  },
  {
    key: "appealToAuthority",
    label: "Appeal to authority",
    pattern: /\b(experts agree|doctors hate this|scientists confirmed|billionaires know|top ceos use|harvard study proves)\b/i,
    score: 22,
    explanation: "Leans on authority or status without showing enough context."
  },
  {
    key: "appealToEmotion",
    label: "Appeal to emotion",
    pattern: /\b(this will break your heart|you will cry|the most heartbreaking|this made me furious|prepare to be angry)\b/i,
    score: 24,
    explanation: "Pushes an emotional reaction as the main argument."
  },
  {
    key: "slipperySlope",
    label: "Slippery slope",
    pattern: /\b(if this happens then|next they will|this is how it starts|soon we won'?t be able|one step away from)\b/i,
    score: 24,
    explanation: "Suggests one event inevitably leads to extreme outcomes."
  },
  {
    key: "confirmationBias",
    label: "Confirmation bias trigger",
    pattern: /\b(proves what we knew|we were right all along|finally admits|the truth we already knew|this confirms everything)\b/i,
    score: 22,
    explanation: "Rewards prior belief rather than encouraging evaluation."
  }
]

export const TONE_PATTERNS: Array<RulePattern<EmotionalToneKey>> = [
  {
    key: "anger",
    label: "Anger",
    pattern: /\b(outrage|furious|rage|betrayed|corrupt|disgusting|sick of|fed up|how dare)\b/i,
    score: 28,
    explanation: "Contains anger-oriented language."
  },
  {
    key: "fear",
    label: "Fear",
    pattern: /\b(scared|terrified|panic|crisis|collapse|danger|threat|doomed|nightmare)\b/i,
    score: 26,
    explanation: "Contains fear-oriented language."
  },
  {
    key: "anxiety",
    label: "Anxiety",
    pattern: /\b(anxious|stressful|overwhelmed|can'?t stop thinking|spiraling|doomscroll|uncertain future|what if|worried|panic)\b/i,
    score: 25,
    explanation: "Contains anxiety-inducing uncertainty or stress language."
  },
  {
    key: "contempt",
    label: "Contempt",
    pattern: /\b(stupid|idiot|pathetic|worthless|clown|trash|braindead|mocking)\b/i,
    score: 28,
    explanation: "Contains contempt or demeaning wording."
  },
  {
    key: "excitement",
    label: "Excitement",
    pattern: /\b(amazing|huge|massive|wild|incredible|finally|breakthrough|game changer)\b/i,
    score: 18,
    explanation: "Uses high-energy positive or novelty framing."
  },
  {
    key: "informational",
    label: "Informational",
    pattern: /\b(explained|guide|tutorial|analysis|review|introduction|how to|walkthrough|research)\b/i,
    score: 24,
    explanation: "Signals an explanatory or learning-oriented format."
  }
]

export const CATEGORY_PATTERNS: Array<RulePattern<CategoryId>> = [
  {
    key: "celebrity-drama",
    label: "Celebrity Drama",
    pattern: /\b(celebrity|influencer|fans are furious|internet reacts|exposed|canceled|apology video|celebrity drama|paparazzi|famous actor|famous singer)\b/i,
    score: 34,
    explanation: "Matches celebrity, influencer, fan reaction, or drama-cycle language."
  },
  {
    key: "political-outrage",
    label: "Political Outrage",
    pattern: /\b(leftists|right wing|liberals|conservatives|woke agenda|political outrage|destroying america|traitors|radical agenda|culture marxism|deep state)\b/i,
    score: 32,
    explanation: "Matches political conflict or identity-framed public affairs language."
  },
  {
    key: "gaming-drama",
    label: "Gaming Drama",
    pattern: /\b(streamer|twitch|console war|gaming drama|devs lied|patch outrage|fans furious|speedrun controversy)\b/i,
    score: 34,
    explanation: "Matches gaming controversy or streamer conflict language."
  },
  {
    key: "crypto-hype",
    label: "Crypto Hype",
    pattern: /\b(crypto|bitcoin|altcoin|token|memecoin|100x|moon|pump|dump|airdrop|wallet)\b/i,
    score: 34,
    explanation: "Matches speculative crypto or price-hype language."
  },
  {
    key: "gambling-content",
    label: "Gambling Content",
    pattern: /\b(betting|casino|odds|parlay|jackpot|slots|sportsbook|roulette|poker)\b/i,
    score: 38,
    explanation: "Matches gambling or betting language."
  },
  {
    key: "productivity-guru",
    label: "Productivity Guru Content",
    pattern: /\b(alex\s*hormozi|@alexhormozi|hormozi|productivity guru|self improvement|self-improvement|setting goals|goal setting|goals wrong|hustle|grindset|millionaire habits|5am routine|escape the matrix|passive income|discipline changed my life|discipline|mindset|motivation|become successful|business advice|entrepreneur habits)\b/i,
    score: 36,
    explanation: "Matches productivity, self-improvement, or status-driven optimization framing."
  },
  {
    key: "relationship-gossip",
    label: "Relationship Gossip",
    pattern: /\b(cheating|breakup|dating drama|relationship gossip|red flag|caught texting|ex girlfriend|ex boyfriend)\b/i,
    score: 32,
    explanation: "Matches relationship scandal or gossip language."
  },
  {
    key: "graphic-injury-gore",
    label: "Gore & Graphic Injury",
    pattern: /\b(gore|graphic content|graphic injury|graphic footage|blood|bloody|bleeding|gruesome|disturbing footage|severe injury|fatal crash|dead body|body found|run over|hit by (a )?(car|bus|truck|train)|dragged by|school bus|crushed|mangled|decapitated|dismembered|amputation|horrific accident|caught on camera)\b/i,
    score: 46,
    explanation: "Matches graphic harm, blood, severe injury, or distressing accident footage."
  },
  {
    key: "conspiracy-content",
    label: "Conspiracy Content",
    pattern: /\b(they don'?t want you to know|wake up sheep|hidden truth|cover[- ]?up|secret agenda|mainstream media lies|do your own research|globalists|shadow government|truth exposed)\b/i,
    score: 38,
    explanation: "Matches secret-plot or hidden-truth framing."
  },
  {
    key: "culture-war",
    label: "Culture War",
    pattern: /\b(cancel culture|anti woke|woke|gender ideology|trad wife|masculinity crisis|culture war|snowflake|sjw|identity politics|triggered)\b/i,
    score: 34,
    explanation: "Matches social identity conflict and culture-war framing."
  },
  {
    key: "financial-hype",
    label: "Financial Hype",
    pattern: /\b(get rich|100x|financial freedom|money hack|secret income|market crash|recession proof|wealth hack|side hustle|passive income|rich by)\b/i,
    score: 34,
    explanation: "Matches speculative wealth or money-urgency framing."
  },
  {
    key: "investment-advice",
    label: "Investment Advice",
    pattern: /\b(stock market|stocks to buy|portfolio|dividend|index fund|options trading|day trading|technical analysis|s&p 500|nasdaq|investing strategy)\b/i,
    score: 30,
    explanation: "Matches investing, trading, or portfolio advice."
  },
  {
    key: "business-entrepreneurship",
    label: "Business & Entrepreneurship",
    pattern: /\b(startup|founder|entrepreneur|sales funnel|business advice|scale your business|agency owner|marketing strategy|customer acquisition|small business)\b/i,
    score: 30,
    explanation: "Matches founder, sales, or business growth content."
  },
  {
    key: "ai-hype",
    label: "AI Hype",
    pattern: /\b(chatgpt|openai|gemini|claude|ai agents?|automation|ai tools?|prompt engineering|replace your job|artificial intelligence|llm)\b/i,
    score: 30,
    explanation: "Matches AI tools, automation, or AI trend content."
  },
  {
    key: "tech-gadget-hype",
    label: "Tech & Gadget Hype",
    pattern: /\b(iphone|android|smartphone|laptop|pc build|gadget|unboxing|tech review|camera test|best headphones|new device)\b/i,
    score: 28,
    explanation: "Matches consumer tech, gadget, or product-review content."
  },
  {
    key: "health-anxiety",
    label: "Health Anxiety",
    pattern: /\b(toxic|symptoms you ignore|silent killer|health warning|dangerous food|hidden disease|your body is warning you|medical emergency|cancer signs)\b/i,
    score: 36,
    explanation: "Matches health fear hooks and symptom alarm framing."
  },
  {
    key: "medical-advice",
    label: "Medical Advice",
    pattern: /\b(treatment|diagnosis|doctor reacts|supplement|protocol|blood test|medicine|therapy|cure|clinical study|nutrition advice)\b/i,
    score: 28,
    explanation: "Matches treatment, supplement, diagnosis, or medical advice."
  },
  {
    key: "fitness-body-image",
    label: "Fitness & Body Image",
    pattern: /\b(gym|workout|bodybuilding|six pack|physique|fat loss|muscle gain|transformation|body fat|bulk|cutting)\b/i,
    score: 30,
    explanation: "Matches fitness, physique, or body-comparison content."
  },
  {
    key: "diet-weight-loss",
    label: "Diet & Weight Loss",
    pattern: /\b(weight loss|lose weight|calorie deficit|intermittent fasting|keto|diet plan|what i eat|fat burning|belly fat|meal prep)\b/i,
    score: 30,
    explanation: "Matches dieting, fasting, and weight-loss content."
  },
  {
    key: "beauty-fashion",
    label: "Beauty & Fashion",
    pattern: /\b(makeup|skincare|outfit|fashion haul|get ready with me|grwm|beauty routine|haircare|style tips|fragrance)\b/i,
    score: 28,
    explanation: "Matches beauty, fashion, and appearance-focused content."
  },
  {
    key: "shopping-deals",
    label: "Shopping & Deals",
    pattern: /\b(amazon finds|must buy|sale|discount|limited deal|haul|best products|worth buying|affiliate|tiktok made me buy)\b/i,
    score: 30,
    explanation: "Matches buying pressure, hauls, and deal content."
  },
  {
    key: "luxury-flex",
    label: "Luxury Flex",
    pattern: /\b(luxury|millionaire lifestyle|private jet|supercar|mansion|designer watch|rich kids|expensive taste|wealth flex)\b/i,
    score: 32,
    explanation: "Matches status display and luxury comparison content."
  },
  {
    key: "influencer-marketing",
    label: "Influencer Marketing",
    pattern: /\b(sponsored|brand deal|use my code|link in bio|course launch|webinar|join my program|limited spots|dm me|creator business)\b/i,
    score: 34,
    explanation: "Matches creator promotion, funnels, or sponsored-style content."
  },
  {
    key: "drama-commentary",
    label: "Drama Commentary",
    pattern: /\b(drama|tea|exposed|called out|response video|controversy explained|apology video|receipts|the situation is crazy)\b/i,
    score: 32,
    explanation: "Matches reaction commentary and controversy recap content."
  },
  {
    key: "true-crime",
    label: "True Crime",
    pattern: /\b(true crime|murder case|serial killer|missing person|interrogation|cold case|crime documentary|bodycam|unsolved mystery)\b/i,
    score: 34,
    explanation: "Matches crime-story suspense and true-crime formats."
  },
  {
    key: "crime-public-safety",
    label: "Crime & Public Safety",
    pattern: /\b(police|arrested|robbery|shooting|crime wave|public safety|caught on camera|911 call|body cam|suspect)\b/i,
    score: 32,
    explanation: "Matches crime reports and public-safety incident content."
  },
  {
    key: "disaster-crisis",
    label: "Disaster & Crisis",
    pattern: /\b(earthquake|flood|wildfire|hurricane|tornado|disaster|emergency alert|collapse|evacuation|crisis update)\b/i,
    score: 32,
    explanation: "Matches disaster, emergency, and crisis update content."
  },
  {
    key: "war-conflict",
    label: "War & Conflict",
    pattern: /\b(war|military|missile|battlefield|invasion|airstrike|gaza|ukraine|soldiers|geopolitics|conflict update)\b/i,
    score: 34,
    explanation: "Matches war, conflict, and military update content."
  },
  {
    key: "sports-drama",
    label: "Sports Drama",
    pattern: /\b(player beef|trade drama|referee controversy|fans furious|locker room drama|hot take|sports debate|coach fired)\b/i,
    score: 32,
    explanation: "Matches sports controversy and heated debate content."
  },
  {
    key: "sports",
    label: "Sports",
    pattern: /\b(nba|nfl|mlb|nhl|football|soccer|cricket|basketball|tennis|highlights|match recap|workout drills)\b/i,
    score: 28,
    explanation: "Matches sports games, highlights, analysis, and training."
  },
  {
    key: "pranks-stunts",
    label: "Pranks & Stunts",
    pattern: /\b(prank|challenge|stunt|gone wrong|social experiment|public reaction|dare|risking|extreme challenge)\b/i,
    score: 32,
    explanation: "Matches prank, stunt, and challenge formats."
  },
  {
    key: "cars-vehicles",
    label: "Cars & Vehicles",
    pattern: /\b(car review|supercar|motorcycle|truck|engine|racing|dashcam|car crash|mechanic|ev review|tesla)\b/i,
    score: 28,
    explanation: "Matches car, bike, repair, racing, and vehicle content."
  },
  {
    key: "parenting-family",
    label: "Parenting & Family",
    pattern: /\b(parenting|family vlog|mom life|dad life|toddler|baby routine|school lunch|child behavior|gentle parenting)\b/i,
    score: 28,
    explanation: "Matches parenting, child behavior, and family-life content."
  },
  {
    key: "religion-spirituality",
    label: "Religion & Spirituality",
    pattern: /\b(christian|islam|hindu|bible|quran|church|temple|spirituality|manifestation|prayer|sermon|faith)\b/i,
    score: 28,
    explanation: "Matches faith, spiritual advice, scripture, or religious debate."
  },
  {
    key: "dating-advice",
    label: "Dating Advice",
    pattern: /\b(dating advice|red flags|attraction|rizz|texting women|texting men|breakup advice|relationship coach|situationship|first date)\b/i,
    score: 32,
    explanation: "Matches dating tactics, attraction advice, and relationship strategy."
  },
  {
    key: "political-news",
    label: "Political News",
    pattern: /\b(election|senator|congress|president|prime minister|parliament|policy|government|campaign|supreme court|white house)\b/i,
    score: 28,
    explanation: "Matches policy, government, and election reporting."
  },
  {
    key: "local-news",
    label: "Local News",
    pattern: /\b(local news|weather alert|traffic update|city council|metro|community update|school district|neighborhood)\b/i,
    score: 26,
    explanation: "Matches regional, city, and community update content."
  },
  {
    key: "education",
    label: "Education",
    pattern: /\b(lecture|course|explained|tutorial|learn|lesson|study|documentary|research)\b/i,
    score: 30,
    explanation: "Matches learning-oriented language."
  },
  {
    key: "programming",
    label: "Programming",
    pattern: /\b(javascript|typescript|python|react|coding|programming|software|api|database|linux|debugging)\b/i,
    score: 36,
    explanation: "Matches software development language."
  },
  {
    key: "news",
    label: "News",
    pattern: /\b(reports|latest update|press conference|breaking|news|officials say|according to)\b/i,
    score: 22,
    explanation: "Matches current-event reporting language."
  },
  {
    key: "science",
    label: "Science",
    pattern: /\b(science|space|nasa|physics|biology|chemistry|climate|researchers|study finds|experiment|astronomy)\b/i,
    score: 28,
    explanation: "Matches research, science, space, and evidence-focused explainers."
  },
  {
    key: "history",
    label: "History",
    pattern: /\b(history|ancient|medieval|world war|empire|historical|archaeology|timeline|documentary history)\b/i,
    score: 28,
    explanation: "Matches historical events, biographies, and timelines."
  },
  {
    key: "documentary",
    label: "Documentary",
    pattern: /\b(documentary|investigation|inside the|full story|deep dive|case study|profile of|behind the scenes)\b/i,
    score: 26,
    explanation: "Matches long-form nonfiction and investigative storytelling."
  },
  {
    key: "cooking-food",
    label: "Cooking & Food",
    pattern: /\b(recipe|cooking|food review|restaurant|street food|meal prep|baking|chef|kitchen|what i eat)\b/i,
    score: 28,
    explanation: "Matches recipes, restaurants, cooking, and food reviews."
  },
  {
    key: "travel",
    label: "Travel",
    pattern: /\b(travel vlog|travel guide|hotel|flight|airport|tourist|destination|things to do in|backpacking|vacation)\b/i,
    score: 28,
    explanation: "Matches travel guides, destinations, and trip vlogs."
  },
  {
    key: "music",
    label: "Music",
    pattern: /\b(music video|official audio|song|album|guitar|piano|cover song|producer reacts|rap|concert|lyrics)\b/i,
    score: 28,
    explanation: "Matches music, instruments, production, covers, and artists."
  },
  {
    key: "movies-tv",
    label: "Movies & TV",
    pattern: /\b(movie review|trailer|tv show|netflix|marvel|dc|film analysis|ending explained|episode recap|cinema)\b/i,
    score: 28,
    explanation: "Matches films, trailers, TV recaps, and entertainment analysis."
  },
  {
    key: "anime-fandom",
    label: "Anime & Fandom",
    pattern: /\b(anime|manga|naruto|one piece|jjk|demon slayer|fandom|fan theory|character ranking|cosplay)\b/i,
    score: 28,
    explanation: "Matches anime, manga, fandom, and fan theory content."
  },
  {
    key: "comedy",
    label: "Comedy",
    pattern: /\b(comedy|stand up|sketch|funny|jokes|comedian|satire|roast|improv|try not to laugh)\b/i,
    score: 26,
    explanation: "Matches comedy, sketches, satire, and funny clips."
  },
  {
    key: "memes",
    label: "Memes",
    pattern: /\b(meme|memes|viral clip|shitpost|internet humor|funny edit|trend compilation|brainrot)\b/i,
    score: 26,
    explanation: "Matches meme formats, trend jokes, and viral humor."
  },
  {
    key: "art-design",
    label: "Art & Design",
    pattern: /\b(art|drawing|illustration|design|animation|photoshop|figma|logo design|creative process|painting)\b/i,
    score: 28,
    explanation: "Matches visual craft, design, and creative process content."
  },
  {
    key: "diy-home",
    label: "DIY & Home",
    pattern: /\b(diy|home repair|woodworking|garden|renovation|cleaning routine|organization|tools|home improvement)\b/i,
    score: 28,
    explanation: "Matches home projects, repair, organization, and practical builds."
  },
  {
    key: "language-learning",
    label: "Language Learning",
    pattern: /\b(learn spanish|learn french|learn english|language learning|vocabulary|grammar|pronunciation|conversation practice)\b/i,
    score: 28,
    explanation: "Matches vocabulary, grammar, pronunciation, and language study."
  },
  {
    key: "career-jobs",
    label: "Career & Jobs",
    pattern: /\b(career advice|resume|job interview|layoffs|workplace|salary negotiation|remote job|job search|corporate life)\b/i,
    score: 30,
    explanation: "Matches careers, interviews, jobs, and workplace content."
  },
  {
    key: "influencer-drama",
    label: "Influencer Drama",
    pattern: /\b(influencer drama|creator drama|apology video|brand trip scandal|creator exposed|unfollowed|called out)\b/i,
    score: 34,
    explanation: "Matches influencer conflict, callout, and apology cycles."
  },
  {
    key: "streamer-drama",
    label: "Streamer Drama",
    pattern: /\b(streamer drama|twitch drama|kick streamer|stream sniped|banned on twitch|livestream meltdown)\b/i,
    score: 34,
    explanation: "Matches livestreamer controversy and platform drama."
  },
  {
    key: "fan-wars",
    label: "Fan Wars",
    pattern: /\b(fan war|stans are fighting|fandom war|fans attack|stan twitter|ship war|fandom meltdown)\b/i,
    score: 32,
    explanation: "Matches fandom conflict and fan identity fights."
  },
  {
    key: "gossip",
    label: "Gossip",
    pattern: /\b(gossip|tea|rumor|spotted with|sources say|inside drama|messy breakup)\b/i,
    score: 30,
    explanation: "Matches rumor-driven interpersonal content."
  },
  {
    key: "esports-drama",
    label: "Esports Drama",
    pattern: /\b(esports drama|pro player drama|team kicked|match fixing|scrim leak|roster drama|tournament controversy)\b/i,
    score: 34,
    explanation: "Matches esports controversy, rosters, and competitive conflict."
  },
  {
    key: "game-leaks",
    label: "Game Leaks",
    pattern: /\b(game leak|leaked gameplay|leaked skin|datamine|datamined|season leak|new agent leak|patch leak)\b/i,
    score: 30,
    explanation: "Matches leak and datamine content around games."
  },
  {
    key: "game-spoilers",
    label: "Game Spoilers",
    pattern: /\b(game spoiler|ending leaked|final boss|spoiler warning|secret ending|story leak|campaign ending)\b/i,
    score: 32,
    explanation: "Matches game plot or ending spoiler content."
  },
  {
    key: "console-wars",
    label: "Console Wars",
    pattern: /\b(console war|xbox vs playstation|ps5 vs xbox|nintendo fans|console fanboys|platform war)\b/i,
    score: 34,
    explanation: "Matches platform loyalty conflict in gaming."
  },
  {
    key: "political-arguments",
    label: "Political Arguments",
    pattern: /\b(debate destroyed|political debate|policy fight|left vs right|liberal tears|conservative meltdown|political argument)\b/i,
    score: 34,
    explanation: "Matches debate clips and adversarial political argument framing."
  },
  {
    key: "ideological-debates",
    label: "Ideological Debates",
    pattern: /\b(capitalism vs socialism|ideology|marxism|libertarian|nationalism|feminism debate|traditional values)\b/i,
    score: 30,
    explanation: "Matches ideology-centered debate and identity alignment content."
  },
  {
    key: "nft-content",
    label: "NFT Content",
    pattern: /\b(nft|nfts|opensea|minting|floor price|jpeg project|web3 collectible|ape collection)\b/i,
    score: 34,
    explanation: "Matches NFT promotion, speculation, and collectibles."
  },
  {
    key: "sports-betting",
    label: "Sports Betting",
    pattern: /\b(sports betting|parlay|odds boost|bet slip|bookmaker|sportsbook|lock of the day|free bet)\b/i,
    score: 40,
    explanation: "Matches sports wagering and odds-driven content."
  },
  {
    key: "forex-gurus",
    label: "Forex Gurus",
    pattern: /\b(forex guru|forex signals|trading signals|prop firm|funded trader|pips|forex mentorship)\b/i,
    score: 36,
    explanation: "Matches forex coaching, signals, and high-pressure trading funnels."
  },
  {
    key: "viral-trends",
    label: "Viral Trends",
    pattern: /\b(viral trend|trending audio|everyone is doing|trend alert|viral challenge|tiktok trend)\b/i,
    score: 28,
    explanation: "Matches trend-chasing and viral format content."
  },
  {
    key: "reaction-content",
    label: "Reaction Content",
    pattern: /\b(reaction|reacts to|watch me react|first reaction|reaction video|reacting live)\b/i,
    score: 28,
    explanation: "Matches reaction-format content."
  },
  {
    key: "shorts",
    label: "Shorts",
    pattern: /\b(#shorts|youtube shorts|shorts compilation|short clip|60 seconds|quick clip)\b/i,
    score: 28,
    explanation: "Matches YouTube Shorts and short-form loops."
  },
  {
    key: "reels",
    label: "Reels",
    pattern: /\b(reels|instagram reels|reel trend|reel audio|viral reel)\b/i,
    score: 28,
    explanation: "Matches short-form reel content."
  },
  {
    key: "relationship-drama",
    label: "Relationship Drama",
    pattern: /\b(relationship drama|messy breakup|cheating scandal|ex drama|couple fight|dating scandal)\b/i,
    score: 34,
    explanation: "Matches romantic conflict and interpersonal drama."
  },
  {
    key: "dating-content",
    label: "Dating Content",
    pattern: /\b(dating content|dating story|first date|dating app|tinder|hinge|bumble|rizz|situationship)\b/i,
    score: 30,
    explanation: "Matches dating stories, apps, and attraction advice."
  },
  {
    key: "consumerism",
    label: "Consumerism",
    pattern: /\b(must buy|things you need|amazon haul|shopping haul|buy this now|product you need|consumer habits)\b/i,
    score: 32,
    explanation: "Matches buying pressure and consumption loops."
  },
  {
    key: "sigma-content",
    label: "Sigma Content",
    pattern: /\b(sigma male|alpha male|high value man|lone wolf mindset|masculine energy|red pill)\b/i,
    score: 36,
    explanation: "Matches status identity and dominance-based self-improvement framing."
  },
  {
    key: "hustle-culture",
    label: "Hustle Culture",
    pattern: /\b(hustle culture|grindset|sleep is for the weak|work 18 hours|no days off|rise and grind)\b/i,
    score: 36,
    explanation: "Matches burnout-prone productivity pressure."
  },
  {
    key: "fake-entrepreneurship",
    label: "Fake Entrepreneurship",
    pattern: /\b(fake guru|course scam|dropshipping millionaire|agency blueprint|get rich course|escape the 9 to 5)\b/i,
    score: 38,
    explanation: "Matches suspicious entrepreneurship funnels and wealth promises."
  },
  {
    key: "crime-news",
    label: "Crime News",
    pattern: /\b(crime news|breaking crime|murder update|arrest report|suspect caught|police update)\b/i,
    score: 32,
    explanation: "Matches crime news and incident updates."
  },
  {
    key: "disaster-news",
    label: "Disaster News",
    pattern: /\b(disaster news|catastrophe|death toll|emergency crews|mass evacuation|severe storm update)\b/i,
    score: 34,
    explanation: "Matches disaster reporting and crisis updates."
  },
  {
    key: "war-news",
    label: "War News",
    pattern: /\b(war news|frontline update|missile strike|troop movement|ceasefire talks|battle update)\b/i,
    score: 34,
    explanation: "Matches war reporting and conflict updates."
  },
  {
    key: "economic-doom",
    label: "Economic Doom Content",
    pattern: /\b(economic doom|market collapse|recession is coming|currency collapse|housing crash|financial crisis)\b/i,
    score: 36,
    explanation: "Matches economy-focused fear and collapse framing."
  },
  {
    key: "doomscroll-news",
    label: "Doomscroll News",
    pattern: /\b(doomscroll|everything is getting worse|world is ending|nonstop bad news|terrible news cycle|crisis after crisis)\b/i,
    score: 38,
    explanation: "Matches prolonged bad-news loops and doomscroll framing."
  },
  {
    key: "anime-spoilers",
    label: "Anime Spoilers",
    pattern: /\b(anime spoiler|episode spoiler|ending spoiler|new episode leak|final arc spoiler|character death)\b/i,
    score: 32,
    explanation: "Matches anime spoiler content."
  },
  {
    key: "manga-spoilers",
    label: "Manga Spoilers",
    pattern: /\b(manga spoiler|chapter leak|raw scans|latest chapter|final panel|manga ending)\b/i,
    score: 32,
    explanation: "Matches manga chapter leak and spoiler content."
  },
  {
    key: "movie-spoilers",
    label: "Movie Spoilers",
    pattern: /\b(movie spoiler|ending explained|post credit scene|plot leak|final scene|spoiler review)\b/i,
    score: 32,
    explanation: "Matches film spoiler and ending content."
  },
  {
    key: "tv-spoilers",
    label: "TV Spoilers",
    pattern: /\b(tv spoiler|episode recap|season finale|finale explained|episode leak|series ending)\b/i,
    score: 32,
    explanation: "Matches TV episode or finale spoiler content."
  }
]
