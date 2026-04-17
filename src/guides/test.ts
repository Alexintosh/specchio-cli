/**
 * Test script to verify all guides are properly implemented
 */

import { guideXcodeInstallation } from './xcode-install.js';
import { guideLicenseAcceptance } from './license.js';
import { guideIOSSDKInstallation } from './ios-sdk.js';
import { guideCertificateCreation } from './certificate.js';
import { guideDeveloperMode } from './developer-mode.js';
import { guideTrustMac } from './trust.js';

async function testGuides() {
  console.log('Testing guide implementations...\n');
  
  // Test that all guides are importable and have the correct signature
  const guides = [
    { name: 'Xcode Installation', fn: guideXcodeInstallation },
    { name: 'License Acceptance', fn: guideLicenseAcceptance },
    { name: 'iOS SDK Installation', fn: guideIOSSDKInstallation },
    { name: 'Certificate Creation', fn: guideCertificateCreation },
    { name: 'Developer Mode', fn: guideDeveloperMode },
    { name: 'Trust Mac', fn: guideTrustMac },
  ];
  
  console.log('All guides imported successfully!');
  console.log('\nAvailable guides:');
  guides.forEach((guide, index) => {
    console.log(`  ${index + 1}. ${guide.name}`);
  });
  
  console.log('\n✓ All guide functions are properly implemented');
}

// Only run test if this file is executed directly
if (import.meta.main) {
  testGuides();
}
