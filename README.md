# FileWell - Universal File Converter

A modern, privacy-focused file conversion tool that runs entirely in your browser. Convert images, audio, and video files without uploading anything to a server.

## Tech Stack

- **Next.js 15**
- **React 19**
- **FFmpeg WebAssembly**
- **Tailwind CSS 4**
- **next-themes**

## Installation & Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/vinegm/FileWell.git
   cd FileWell
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Web Interface

1. **Upload Files** - Drag and drop files or click to select
2. **Choose Format** - Select your desired output format
3. **Convert** - Click convert and wait for processing
4. **Download** - Download your converted files

### Using the Converter Utility

The conversion engine can also be used programmatically:

```javascript
import converter from "@/utils/convert";

// Convert a file
try {
  const { blob, mime } = await converter.convertFile(originalFile, "mp4");

  // Create download URL
  const url = URL.createObjectURL(blob);

  // Use the converted file...
} catch (error) {
  console.error("Conversion failed:", error.message);
}
```

#### Converter Methods

```javascript
// Get file extension
const ext = converter.getFileExtension("video.mp4"); // 'mp4'

// Remove file extension
const name = converter.removeFileExtension("video.mp4"); // 'video'

// Universal conversion
const result = await converter.convertFile(file, "targetFormat");
```

## Available Scripts

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run start  # Start production server
npm run lint   # Run ESLint
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
