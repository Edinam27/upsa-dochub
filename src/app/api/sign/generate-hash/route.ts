import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { signerName, documentName } = await req.json();

    if (!signerName || !documentName) {
      return NextResponse.json(
        { error: 'Signer name and document name are required' },
        { status: 400 }
      );
    }

    // Generate a unique hash
    // We combine timestamp, random value, and input data to ensure uniqueness
    const dataToHash = `${signerName}-${documentName}-${Date.now()}-${Math.random()}`;
    const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');

    // Store in Database
    const record = await prisma.signatureVerification.create({
      data: {
        hash,
        signerName,
        documentName,
        status: 'VALID',
      },
    });

    return NextResponse.json({
      hash: record.hash,
      id: record.id,
      timestamp: record.createdAt,
    });
  } catch (error) {
    console.error('Error generating signature hash:', error);
    return NextResponse.json(
      { error: 'Failed to generate signature hash' },
      { status: 500 }
    );
  }
}
