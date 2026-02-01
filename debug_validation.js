// Debug validation to see what's causing the failure
const fs = require('fs');

console.log('🔍 调试验证测试...\n');

const firebaseConfig = fs.readFileSync('./firebase-config.js', 'utf8');

console.log('检查错误变量名...');
console.log('包含 "terForm"?', firebaseConfig.includes('terForm'));
console.log('包含 "egisterForm"?', firebaseConfig.includes('egisterForm'));
console.log('包含 "Form.password"?', firebaseConfig.includes('Form.password'));

// Find any lines that might have the wrong pattern
const lines = firebaseConfig.split('\n');
lines.forEach((line, index) => {
    if (line.includes('Form.') && !line.includes('loginForm') && !line.includes('registerForm')) {
        console.log(`可疑行 ${index + 1}: ${line.trim()}`);
    }
});

// More specific search
const suspiciousPatterns = [
    /[^l]terForm/g,
    /[^r]egisterForm/g,
    /Form\.[a-zA-Z]*\.value/g
];

suspiciousPatterns.forEach(pattern => {
    const matches = firebaseConfig.match(pattern);
    if (matches) {
        console.log(`发现可疑模式 ${pattern}:`, matches);
    }
});

// Let's also check for any partial matches
console.log('\n检查可能的拼写错误...');
const allMatches = firebaseConfig.match(/\w*Form\.\w*/g);
if (allMatches) {
    console.log('所有Form相关的匹配:');
    allMatches.forEach(match => {
        if (!['loginForm.', 'registerForm.'].some(valid => match.startsWith(valid))) {
            console.log(`  - 可疑: ${match}`);
        } else {
            console.log(`  - 正常: ${match}`);
        }
    });
}

console.log('\n检查registerForm部分...');
const registerFormSection = lines.slice(40, 60); // Around the register form handling
registerFormSection.forEach((line, idx) => {
    if (line.includes('Form') || line.includes('displayName') || line.includes('confirmPassword')) {
        console.log(`  Line ${idx + 41}: ${line.trim()}`);
    }
});