// Test script for WooCommerce MCP Server
// This script demonstrates how to interact with the server

const BASE_URL = 'http://localhost:3000';

// Test functions
async function testHealthCheck() {
  console.log('🔍 Testing health check...');
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    console.log('✅ Health check result:', data);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
}

async function testListTools() {
  console.log('\n🔍 Testing list tools...');
  try {
    const response = await fetch(`${BASE_URL}/tools`);
    const data = await response.json();
    console.log('✅ Available tools:', data.tools.length);
    data.tools.forEach(tool => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });
  } catch (error) {
    console.error('❌ List tools failed:', error.message);
  }
}

async function testProcessOrderCommand() {
  console.log('\n🔍 Testing order command processing...');
  try {
    const response = await fetch(`${BASE_URL}/process-command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command: '#643645 mark this order as completed'
      })
    });
    const data = await response.json();
    console.log('✅ Order command result:', data);
  } catch (error) {
    console.error('❌ Order command failed:', error.message);
  }
}

async function testGenerateContent() {
  console.log('\n🔍 Testing content generation...');
  try {
    const response = await fetch(`${BASE_URL}/generate-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentType: 'product description',
        context: 'Premium wireless headphones with noise cancellation'
      })
    });
    const data = await response.json();
    console.log('✅ Content generation result:', data);
  } catch (error) {
    console.error('❌ Content generation failed:', error.message);
  }
}

async function testFileOperations() {
  console.log('\n🔍 Testing file operations...');
  try {
    // Test reading a file
    const readResponse = await fetch(`${BASE_URL}/files/wp-config.php`);
    const readData = await readResponse.json();
    console.log('✅ File read result:', readData.success ? 'Success' : 'Failed');
    
    // Test writing a file
    const writeResponse = await fetch(`${BASE_URL}/files/test-file.txt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: 'This is a test file created by the MCP server'
      })
    });
    const writeData = await writeResponse.json();
    console.log('✅ File write result:', writeData.success ? 'Success' : 'Failed');
  } catch (error) {
    console.error('❌ File operations failed:', error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting WooCommerce MCP Server Tests\n');
  
  await testHealthCheck();
  await testListTools();
  await testProcessOrderCommand();
  await testGenerateContent();
  await testFileOperations();
  
  console.log('\n✨ All tests completed!');
}

// Run tests if this script is executed directly
if (typeof window === 'undefined') {
  runTests().catch(console.error);
}

module.exports = {
  testHealthCheck,
  testListTools,
  testProcessOrderCommand,
  testGenerateContent,
  testFileOperations,
  runTests
};
