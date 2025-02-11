// DOM元素
const englishNameInput = document.getElementById('englishName');
const generateBtn = document.getElementById('generateBtn');
const loadingElement = document.getElementById('loading');
const resultsElement = document.getElementById('results');

// 显示错误消息
function showError(message) {
    // 处理API错误消息，使其更友好
    let friendlyMessage = message;
    if (message.includes('403')) {
        friendlyMessage = '抱歉，API密钥可能已过期或无效。请联系管理员更新API密钥。';
    } else if (message.includes('400')) {
        friendlyMessage = '抱歉，请求格式有误。请检查输入并重试。';
    } else if (message.includes('429')) {
        friendlyMessage = '抱歉，请求太频繁。请稍等一会儿再试。';
    } else if (message.includes('500')) {
        friendlyMessage = '抱歉，服务器出现问题。请稍后再试。';
    } else if (message.includes('504')) {
        friendlyMessage = '抱歉，服务器响应超时。请稍后再试。';
    }

    const errorHtml = `
        <div class="error-message">
            <h3>生成失败</h3>
            <p>${friendlyMessage}</p>
            ${message.includes('403') ? '<p style="margin-top: 0.5rem; font-size: 0.9em;">技术详情：API密钥认证失败</p>' : ''}
        </div>
    `;
    resultsElement.innerHTML = errorHtml;
    resultsElement.style.display = 'block';
}

// 显示加载动画和提示
let loadingInterval;
const loadingMessages = [
    "正在分析您的英文名...",
    "查找最匹配的中文字...",
    "融入传统文化元素...",
    "优化音韵和谐度...",
    "编写名字寓意...",
    "即将完成，请稍候..."
];

function showLoading() {
    loadingElement.style.display = 'block';
    resultsElement.style.display = 'none';
    generateBtn.disabled = true;

    let messageIndex = 0;
    const loadingText = loadingElement.querySelector('.loading-text p:first-child');
    
    // 更新加载消息
    loadingInterval = setInterval(() => {
        loadingText.textContent = loadingMessages[messageIndex];
        messageIndex = (messageIndex + 1) % loadingMessages.length;
    }, 3000);
}

// 隐藏加载动画
function hideLoading() {
    loadingElement.style.display = 'none';
    generateBtn.disabled = false;
    if (loadingInterval) {
        clearInterval(loadingInterval);
    }
}

// 创建名字卡片HTML
function createNameCard(name, index) {
    return `
        <div class="name-card" style="animation: fadeIn ${0.3 + index * 0.1}s ease-out;">
            <h2>${name.chinese}</h2>
            <p style="text-align: center; color: #666;">${name.pinyin}</p>
            <div class="meaning">
                <h3>中文寓意：</h3>
                <p>${name.meaning_cn}</p>
                <h3>English Meaning：</h3>
                <p>${name.meaning_en}</p>
            </div>
        </div>
    `;
}

// 显示结果
function displayResults(data) {
    if (!data.names || data.names.length === 0) {
        showError('生成的名字列表为空');
        return;
    }
    
    const namesHtml = data.names.map((name, index) => createNameCard(name, index)).join('');
    resultsElement.innerHTML = namesHtml;
    resultsElement.style.display = 'block';
}

// 处理生成按钮点击
async function handleGenerate() {
    const englishName = englishNameInput.value.trim();
    
    if (!englishName) {
        showError('请输入英文名！');
        return;
    }

    try {
        showLoading();
        console.log('开始生成名字...');
        const data = await generateChineseNames(englishName);
        console.log('生成完成，显示结果...');
        displayResults(data);
    } catch (error) {
        console.error('生成名字时出错:', error);
        showError(error.message || '生成名字时出错，请稍后重试！');
    } finally {
        hideLoading();
    }
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

// 事件监听
generateBtn.addEventListener('click', handleGenerate);
englishNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleGenerate();
    }
});
