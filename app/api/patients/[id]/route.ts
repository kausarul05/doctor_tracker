import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Patient from '@/models/Patient';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    const patient = await Patient.findById(params.id)
      .populate('doctorId', 'name specialization hospital')
      .lean();

    if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    return NextResponse.json({ patient });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    const body = await request.json();
    const patient = await Patient.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    }).populate('doctorId', 'name specialization hospital');

    if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    return NextResponse.json({ patient });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    const patient = await Patient.findByIdAndDelete(params.id);
    if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });

    return NextResponse.json({ message: 'Patient deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
