import { beforeAll, afterEach } from 'vitest';

// Setup global test configuration
beforeAll(() => {
  // Mock any global objects if needed
});

afterEach(() => {
  // Clean up after each test
});

// Mock File API for Node.js environment
if (typeof File === 'undefined') {
  global.File = class File extends Blob {
    name: string;
    lastModified: number;

    constructor(bits: BlobPart[], name: string, options?: FilePropertyBag) {
      super(bits, options);
      this.name = name;
      this.lastModified = options?.lastModified || Date.now();
    }
  } as any;
}

// Mock ArrayBuffer methods if needed
if (typeof Blob !== 'undefined' && !Blob.prototype.arrayBuffer) {
  Blob.prototype.arrayBuffer = async function() {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as ArrayBuffer);
      };
      reader.readAsArrayBuffer(this);
    });
  };
}