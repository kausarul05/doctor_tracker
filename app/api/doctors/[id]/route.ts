import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Doctor from '@/models/Doctor';
import Patient from '@/models/Patient';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    const doctor = await Doctor.findById(params.id).lean();
    if (!doctor) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });

    const patients = await Patient.find({ doctorId: params.id })
      .sort({ admittedAt: -1 })
      .lean();

    return NextResponse.json({ doctor, patients });
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
    const doctor = await Doctor.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!doctor) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    return NextResponse.json({ doctor });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    const doctor = await Doctor.findByIdAndDelete(params.id);
    if (!doctor) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });

    // Delete all patients under this doctor
    await Patient.deleteMany({ doctorId: params.id });

    return NextResponse.json({ message: 'Doctor and all associated patients deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
