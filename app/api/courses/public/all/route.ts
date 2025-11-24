import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock courses data with additional properties for the dashboard
    const courses = [
      {
        id: 'course-123456',
        title: 'Advanced Kung Fu Training',
        name: 'Advanced Kung Fu Training', // Add name property for compatibility
        code: 'KF-ADV-001',
        description: 'A comprehensive course covering advanced Kung Fu techniques.',
        difficulty_level: 'Advanced',
        pricing: {
          currency: 'INR',
          amount: 8500,
          branch_specific_pricing: false
        },
        student_requirements: {
          max_students: 20,
          min_age: 16,
          max_age: 50,
          prerequisites: ['Basic Kung Fu']
        },
        settings: {
          active: true,
          offers_certification: true
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Additional properties for dashboard display
        icon: '🥋',
        branches: 3,
        branchLocations: ['Hyderabad', 'Mumbai', 'Delhi'],
        coachs: 2,
        students: 45,
        enabled: true
      },
      {
        id: 'course-789012',
        title: 'Beginner Karate',
        name: 'Beginner Karate',
        code: 'KR-BEG-001',
        description: 'Introduction to Karate fundamentals and basic techniques.',
        difficulty_level: 'Beginner',
        pricing: {
          currency: 'INR',
          amount: 5500,
          branch_specific_pricing: false
        },
        student_requirements: {
          max_students: 25,
          min_age: 8,
          max_age: 60,
          prerequisites: []
        },
        settings: {
          active: true,
          offers_certification: true
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Additional properties for dashboard display
        icon: '🥊',
        branches: 5,
        branchLocations: ['Hyderabad', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai'],
        coachs: 3,
        students: 78,
        enabled: true
      },
      {
        id: 'course-345678',
        title: 'Mixed Martial Arts',
        name: 'Mixed Martial Arts',
        code: 'MMA-INT-001',
        description: 'Intermediate level mixed martial arts training combining multiple disciplines.',
        difficulty_level: 'Intermediate',
        pricing: {
          currency: 'INR',
          amount: 12000,
          branch_specific_pricing: true
        },
        student_requirements: {
          max_students: 15,
          min_age: 18,
          max_age: 45,
          prerequisites: ['Basic Martial Arts', 'Physical Fitness']
        },
        settings: {
          active: true,
          offers_certification: true
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Additional properties for dashboard display
        icon: '🤼',
        branches: 2,
        branchLocations: ['Mumbai', 'Delhi'],
        coachs: 4,
        students: 32,
        enabled: true
      }
    ]
    
    return NextResponse.json(
      {
        message: 'Courses retrieved successfully',
        courses,
        total: courses.length
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Error retrieving courses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
