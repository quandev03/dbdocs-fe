/**
 * Test script để kiểm tra localStorage avatar functionality
 * Chạy script này trong browser console tại DocumentationPage
 */

// Test data mẫu
const testUserData = {
  userId: "d962a163-cc0d-4738-ac30-5969edb82d6e",
  email: "quandaingokk@gmail.com",
  fullName: "Hồng Quân Ngô",
  avatarUrl: "https://lh3.googleusercontent.com/a/ACg8ocIZ77yNg8nij4WIPz6CVRB37EUtznjM89C7JasP3iEuC2v__0Gk=s96-c",
  provider: 1
};

// Alternative test data
const alternativeUserData = {
  userId: "test-user-123",
  email: "test@example.com", 
  fullName: "Test User",
  avatarUrl: "https://ui-avatars.com/api/?name=Test+User&background=1890ff&color=fff",
  provider: 2
};

console.log("🧪 Testing localStorage Avatar Functionality");
console.log("=".repeat(50));

// Function để test localStorage
function testLocalStorageAvatar() {
  console.log("1️⃣ Testing original user data...");
  
  // Set test data vào localStorage
  localStorage.setItem('dbdocs_user', JSON.stringify(testUserData));
  console.log("✅ Set localStorage:", testUserData);
  
  // Verify data
  const storedData = localStorage.getItem('dbdocs_user');
  if (storedData) {
    const parsed = JSON.parse(storedData);
    console.log("✅ Retrieved from localStorage:", parsed);
    console.log("🖼️ Avatar URL:", parsed.avatarUrl);
  }
  
  console.log("\n2️⃣ Testing alternative user data...");
  
  // Test với alternative data
  setTimeout(() => {
    localStorage.setItem('dbdocs_user', JSON.stringify(alternativeUserData));
    console.log("✅ Set alternative data:", alternativeUserData);
    console.log("🔄 Refresh page để thấy avatar mới!");
  }, 3000);
  
  console.log("\n3️⃣ Instructions:");
  console.log("📝 1. Kiểm tra avatar trong header dropdown");
  console.log("📝 2. Check Recent Activity avatars (Wiki tab)");
  console.log("📝 3. Check Changelog avatars (Changelog tab)");
  console.log("📝 4. Refresh page sau 3 giây để thấy avatar mới");
}

// Function để clear localStorage
function clearLocalStorageTest() {
  console.log("🗑️ Clearing localStorage test data...");
  localStorage.removeItem('dbdocs_user');
  console.log("✅ localStorage cleared. Avatar sẽ fallback về API.");
}

// Function để inspect hiện tại
function inspectCurrentState() {
  console.log("🔍 Current localStorage state:");
  const userData = localStorage.getItem('dbdocs_user');
  if (userData) {
    try {
      const parsed = JSON.parse(userData);
      console.table(parsed);
      console.log("🖼️ Current avatar URL:", parsed.avatarUrl);
    } catch (e) {
      console.error("❌ Invalid JSON in localStorage:", e);
    }
  } else {
    console.log("📭 No dbdocs_user data in localStorage");
  }
}

// Export functions để có thể gọi từ console
window.testLocalStorageAvatar = testLocalStorageAvatar;
window.clearLocalStorageTest = clearLocalStorageTest;
window.inspectCurrentState = inspectCurrentState;

// Auto run inspection
inspectCurrentState();

console.log("\n🎮 Available functions:");
console.log("• testLocalStorageAvatar() - Test localStorage functionality");
console.log("• clearLocalStorageTest() - Clear test data");
console.log("• inspectCurrentState() - Check current state");
console.log("\n📖 Copy và paste vào browser console để test!"); 