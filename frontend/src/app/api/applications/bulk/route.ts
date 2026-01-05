import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

// Bulk update applications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationIds, action, data } = body;
    
    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return NextResponse.json({ error: 'No applications specified' }, { status: 400 });
    }
    
    const collection = await getCollection('applications');
    
    let updateResult;
    
    switch (action) {
      case 'move':
        if (!data?.stage) {
          return NextResponse.json({ error: 'Stage is required for move action' }, { status: 400 });
        }
        updateResult = await collection.updateMany(
          { id: { $in: applicationIds } },
          { $set: { stage: data.stage, status: data.status || data.stage } }
        );
        break;
        
      case 'archive':
        updateResult = await collection.updateMany(
          { id: { $in: applicationIds } },
          { $set: { status: 'archived', stage: 'archived' } }
        );
        break;
        
      case 'reject':
        updateResult = await collection.updateMany(
          { id: { $in: applicationIds } },
          { $set: { status: 'rejected', stage: 'rejected' } }
        );
        break;
        
      case 'export':
        // Fetch applications for export
        const applications = await collection.find({ id: { $in: applicationIds } }).toArray();
        const exportData = applications.map(app => {
          const { _id, ...data } = app;
          return data;
        });
        return NextResponse.json({ success: true, data: exportData });
        
      case 'email':
        // In a real app, integrate with email service
        return NextResponse.json({ 
          success: true, 
          message: `Email would be sent to ${applicationIds.length} candidates` 
        });
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: true, 
      modifiedCount: updateResult?.modifiedCount || 0 
    });
  } catch (error) {
    console.error('Bulk action error:', error);
    return NextResponse.json({ error: 'Bulk action failed' }, { status: 500 });
  }
}
