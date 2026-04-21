import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Patient from '@/models/Patient';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const condition = searchParams.get('condition') || '';
    const doctorId = searchParams.get('doctorId') || '';
    const gender = searchParams.get('gender') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { diagnosis: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (condition) query.condition = condition;
    if (doctorId) query.doctorId = doctorId;
    if (gender) query.gender = gender;

    if (dateFrom || dateTo) {
      query.admittedAt = {};
      if (dateFrom) query.admittedAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        query.admittedAt.$lte = endDate;
      }
    }

    const [patients, total] = await Promise.all([
      Patient.find(query)
        .populate('doctorId', 'name specialization hospital')
        .sort({ admittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Patient.countDocuments(query),
    ]);

    return NextResponse.json({
      patients,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    const body = await request.json();
    const { name, age, gender, condition, diagnosis, phone, email, address, doctorId, admittedAt } = body;

    if (!name || !age || !gender || !condition || !diagnosis || !phone || !doctorId) {
      return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 });
    }

    const patient = await Patient.create({
      name, age, gender, condition, diagnosis, phone, email, address, doctorId,
      admittedAt: admittedAt ? new Date(admittedAt) : new Date(),
    });

    await patient.populate('doctorId', 'name specialization hospital');

    return NextResponse.json({ patient }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
