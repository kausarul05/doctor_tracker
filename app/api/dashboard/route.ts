import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Doctor from '@/models/Doctor';
import Patient from '@/models/Patient';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    const [
      totalDoctors,
      totalPatients,
      conditionStats,
      patientsPerDoctor,
      monthlyAdmissions,
      specializationStats,
    ] = await Promise.all([
      Doctor.countDocuments(),
      Patient.countDocuments(),

      Patient.aggregate([
        { $group: { _id: '$condition', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      Patient.aggregate([
        {
          $group: {
            _id: '$doctorId',
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'doctors',
            localField: '_id',
            foreignField: '_id',
            as: 'doctor',
          },
        },
        { $unwind: '$doctor' },
        {
          $project: {
            doctorName: '$doctor.name',
            specialization: '$doctor.specialization',
            count: 1,
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      Patient.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$admittedAt' },
              month: { $month: '$admittedAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 },
      ]),

      Doctor.aggregate([
        { $group: { _id: '$specialization', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
    ]);

    // Format monthly admissions
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthly = monthlyAdmissions
      .reverse()
      .map((item: any) => ({
        month: `${months[item._id.month - 1]} ${item._id.year}`,
        patients: item.count,
      }));

    return NextResponse.json({
      totalDoctors,
      totalPatients,
      avgPatientsPerDoctor: totalDoctors > 0 ? (totalPatients / totalDoctors).toFixed(1) : 0,
      conditionStats: conditionStats.map((s: any) => ({ name: s._id, value: s.count })),
      patientsPerDoctor,
      monthlyAdmissions: formattedMonthly,
      specializationStats: specializationStats.map((s: any) => ({ name: s._id, value: s.count })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
