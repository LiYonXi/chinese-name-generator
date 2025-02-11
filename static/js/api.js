// API配置
const API_CONFIG = {
    apiKey: 'sk-xkiuhcpwstylowmfhnxfhuawwhzvxdfaupswxxmrkksbpkpf',
    model: 'google/gemma-2-9b-it',  // 使用 Gemma 2 9B 模型
    endpoint: 'https://api.siliconflow.cn/v1/chat/completions',
    timeout: 60000
};

// 名字缓存系统
class NameCache {
    constructor() {
        this.cache = new Map();
        this.maxSize = 100; // 最大缓存数量
        this.loadFromStorage();
    }

    // 从localStorage加载缓存
    loadFromStorage() {
        try {
            const savedCache = localStorage.getItem('nameCache');
            if (savedCache) {
                const parsed = JSON.parse(savedCache);
                Object.entries(parsed).forEach(([key, value]) => {
                    this.cache.set(key, {
                        data: value.data,
                        timestamp: new Date(value.timestamp)
                    });
                });
                this.cleanOldCache();
            }
        } catch (error) {
            console.error('加载缓存失败:', error);
        }
    }

    // 保存缓存到localStorage
    saveToStorage() {
        try {
            const cacheObject = {};
            this.cache.forEach((value, key) => {
                cacheObject[key] = {
                    data: value.data,
                    timestamp: value.timestamp.toISOString()
                };
            });
            localStorage.setItem('nameCache', JSON.stringify(cacheObject));
        } catch (error) {
            console.error('保存缓存失败:', error);
        }
    }

    // 清理过期缓存
    cleanOldCache() {
        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000; // 一天的毫秒数
        
        // 删除超过一天的缓存
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > oneDay) {
                this.cache.delete(key);
            }
        }

        // 如果缓存数量超过最大值，删除最旧的条目
        if (this.cache.size > this.maxSize) {
            const sortedEntries = [...this.cache.entries()]
                .sort((a, b) => a[1].timestamp - b[1].timestamp);
            
            const entriesToDelete = sortedEntries.slice(0, this.cache.size - this.maxSize);
            entriesToDelete.forEach(([key]) => this.cache.delete(key));
        }

        this.saveToStorage();
    }

    // 获取缓存的名字
    get(englishName) {
        const cacheItem = this.cache.get(englishName.toLowerCase());
        if (cacheItem) {
            const now = new Date();
            const oneDay = 24 * 60 * 60 * 1000;
            
            // 检查缓存是否过期
            if (now - cacheItem.timestamp < oneDay) {
                return cacheItem.data;
            } else {
                this.cache.delete(englishName.toLowerCase());
                this.saveToStorage();
            }
        }
        return null;
    }

    // 设置缓存
    set(englishName, data) {
        this.cache.set(englishName.toLowerCase(), {
            data,
            timestamp: new Date()
        });
        this.cleanOldCache();
    }
}

// 创建缓存实例
const nameCache = new NameCache();

// 生成系统提示词
function generateSystemPrompt() {
    return `你是一位精通中国文化和起名的专家。请根据用户提供的英文名，生成三个富有中国文化特色的中文名。
每个名字都应该：
1. 体现中国传统文化内涵
2. 音韵优美
3. 寓意吉祥
4. 适合实际使用

请严格按照以下JSON格式返回结果：
{
    "names": [
        {
            "chinese": "中文名1",
            "pinyin": "拼音1",
            "meaning_cn": "中文含义解释1",
            "meaning_en": "英文含义解释1"
        },
        {
            "chinese": "中文名2",
            "pinyin": "拼音2",
            "meaning_cn": "中文含义解释2",
            "meaning_en": "英文含义解释2"
        },
        {
            "chinese": "中文名3",
            "pinyin": "拼音3",
            "meaning_cn": "中文含义解释3",
            "meaning_en": "英文含义解释3"
        }
    ]
}`;
}

// 生成用户提示词
function generateUserPrompt(englishName) {
    return `请为英文名"${englishName}"生成三个独特的中文名。请确保返回的是有效的JSON格式。`;
}

// 添加重试逻辑
async function fetchWithRetry(url, options, maxRetries = 2) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
            
            try {
                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                return response;
            } finally {
                clearTimeout(timeoutId);
            }
        } catch (error) {
            console.log(`尝试 ${i + 1}/${maxRetries} 失败:`, error);
            lastError = error;
            
            if (error.name === 'AbortError') {
                throw new Error('请求超时，这可能是因为服务器比较忙。请稍后再试，或者刷新页面重试。');
            }
            
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
            }
        }
    }
    
    throw lastError;
}

// 清理API返回的内容
function cleanApiResponse(content) {
    try {
        // 移除可能的markdown标记
        content = content.replace(/```json\n/g, '');
        content = content.replace(/```\n/g, '');
        content = content.replace(/```/g, '');
        
        // 移除可能的空白行
        content = content.trim();
        
        return content;
    } catch (error) {
        console.error('清理API响应时出错:', error);
        return content;
    }
}

// 调用API生成名字
async function generateChineseNames(englishName) {
    try {
        console.log('开始生成名字...');
        
        // 检查缓存
        const cachedResult = nameCache.get(englishName);
        if (cachedResult) {
            console.log('使用缓存的结果');
            return cachedResult;
        }

        console.log('开始API请求...');
        const requestBody = {
            model: API_CONFIG.model,
            messages: [
                {
                    role: 'system',
                    content: generateSystemPrompt()
                },
                {
                    role: 'user',
                    content: generateUserPrompt(englishName)
                }
            ],
            temperature: 0.8,
            max_tokens: 2000,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        };

        console.log('请求体:', JSON.stringify(requestBody, null, 2));

        const response = await fetchWithRetry(API_CONFIG.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_CONFIG.apiKey.trim()}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log('收到响应:', response.status, response.statusText);

        const responseText = await response.text();
        console.log('原始响应:', responseText);

        if (!response.ok) {
            console.error('API错误响应:', responseText);
            throw new Error(`API请求失败: ${response.status} ${response.statusText}\n${responseText}`);
        }

        const data = JSON.parse(responseText);
        console.log('API返回数据:', JSON.stringify(data, null, 2));
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
            console.error('API返回数据格式不正确:', data);
            throw new Error('API返回格式不正确');
        }

        let content = data.choices[0].message.content;
        console.log('原始content:', content);
        
        // 清理API返回的内容
        content = cleanApiResponse(content);
        console.log('清理后的content:', content);
        
        try {
            const parsedContent = JSON.parse(content);
            
            if (!parsedContent.names || !Array.isArray(parsedContent.names) || parsedContent.names.length === 0) {
                console.error('返回数据格式验证失败:', parsedContent);
                throw new Error('返回数据格式不正确');
            }
            
            // 保存到缓存
            nameCache.set(englishName, parsedContent);
            
            return parsedContent;
        } catch (parseError) {
            console.error('JSON解析错误:', parseError, '\n原始内容:', content);
            throw new Error('无法解析API返回的数据，请重试');
        }
    } catch (error) {
        console.error('生成名字时出错:', error);
        throw error;
    }
}
