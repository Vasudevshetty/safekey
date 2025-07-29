import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const metadataPath = path.join(
      process.cwd(),
      '..',
      'docs',
      'metadata.json'
    );

    if (!fs.existsSync(metadataPath)) {
      return NextResponse.json(
        { error: 'Metadata file not found' },
        { status: 404 }
      );
    }

    const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
    const metadata = JSON.parse(metadataContent);

    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Error reading metadata:', error);
    return NextResponse.json(
      { error: 'Failed to load metadata' },
      { status: 500 }
    );
  }
}
