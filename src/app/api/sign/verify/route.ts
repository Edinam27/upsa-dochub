import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { hash } = await req.json();

    if (!hash) {
      return NextResponse.json(
        { error: 'Hash is required' },
        { status: 400 }
      );
    }

    const record = await prisma.signatureVerification.findUnique({
      where: { hash },
    });

    if (!record) {
      return NextResponse.json(
        { valid: false, message: 'Signature not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: record.status === 'VALID',
      signerName: record.signerName,
      documentName: record.documentName,
      timestamp: record.createdAt,
      status: record.status,
    });
  } catch (error) {
    console.error('Error verifying signature:', error);
    return NextResponse.json(
      { error: 'Failed to verify signature' },
      { status: 500 }
    );
  }
}
