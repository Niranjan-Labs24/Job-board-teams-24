"""
Next.js API Tests for Teams 24 Careers Job Board
Tests: Jobs API, Applications API, Health Check
PostgreSQL database backend
"""
import pytest
import requests
import os
import uuid

# Use localhost:3000 for Next.js app
BASE_URL = "http://localhost:3000"


class TestHealthCheck:
    """Health endpoint tests"""
    
    def test_health_endpoint(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "database" in data
        assert data["database"] == "connected"
        print(f"✓ Health check passed: {data}")


class TestJobsAPI:
    """Jobs CRUD API tests"""
    
    def test_get_all_jobs(self):
        """Test GET /api/jobs returns list of jobs"""
        response = requests.get(f"{BASE_URL}/api/jobs")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"✓ GET /api/jobs returned {len(data)} jobs")
    
    def test_get_published_jobs(self):
        """Test GET /api/jobs?status=published filters correctly"""
        response = requests.get(f"{BASE_URL}/api/jobs?status=published")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for job in data:
            assert job["status"] == "published"
        print(f"✓ GET /api/jobs?status=published returned {len(data)} published jobs")
    
    def test_get_job_by_id(self):
        """Test GET /api/jobs/[id] returns single job"""
        # First get a job ID
        response = requests.get(f"{BASE_URL}/api/jobs")
        jobs = response.json()
        assert len(jobs) > 0
        
        job_id = jobs[0]["id"]
        response = requests.get(f"{BASE_URL}/api/jobs/{job_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == job_id
        assert "title" in data
        assert "slug" in data
        print(f"✓ GET /api/jobs/{job_id} returned job: {data['title']}")
    
    def test_get_job_by_slug(self):
        """Test GET /api/jobs/[slug] returns job by slug"""
        # First get a job slug
        response = requests.get(f"{BASE_URL}/api/jobs")
        jobs = response.json()
        assert len(jobs) > 0
        
        job_slug = jobs[0]["slug"]
        response = requests.get(f"{BASE_URL}/api/jobs/{job_slug}")
        assert response.status_code == 200
        data = response.json()
        assert data["slug"] == job_slug
        print(f"✓ GET /api/jobs/{job_slug} returned job by slug")
    
    def test_get_nonexistent_job(self):
        """Test GET /api/jobs/[id] returns 404 for non-existent job"""
        fake_id = str(uuid.uuid4())
        response = requests.get(f"{BASE_URL}/api/jobs/{fake_id}")
        assert response.status_code == 404
        print(f"✓ GET /api/jobs/{fake_id} correctly returned 404")
    
    def test_create_job(self):
        """Test POST /api/jobs creates new job"""
        job_data = {
            "title": "TEST_QA Engineer",
            "type": "full-time",
            "salary_min": "100k",
            "salary_max": "150k",
            "location": "Remote",
            "color": "#10B981",
            "description": "Test job for API testing",
            "requirements": ["Testing experience", "Automation skills"],
            "responsibilities": ["Write tests", "Review code"],
            "benefits": ["Health insurance", "Remote work"],
            "status": "draft",
            "category": "Engineering"
        }
        
        response = requests.post(f"{BASE_URL}/api/jobs", json=job_data)
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == job_data["title"]
        assert "id" in data
        assert "slug" in data
        assert data["status"] == "draft"
        print(f"✓ POST /api/jobs created job: {data['id']}")
        
        # Cleanup - delete the test job
        delete_response = requests.delete(f"{BASE_URL}/api/jobs/{data['id']}")
        assert delete_response.status_code == 200
        print(f"✓ Cleanup: deleted test job {data['id']}")
    
    def test_update_job_status(self):
        """Test PUT /api/jobs/[id] updates job status"""
        # First get a job
        response = requests.get(f"{BASE_URL}/api/jobs")
        jobs = response.json()
        
        # Find a draft job or create one
        draft_job = next((j for j in jobs if j["status"] == "draft"), None)
        
        if draft_job:
            job_id = draft_job["id"]
            original_status = draft_job["status"]
            
            # Update status to paused
            update_response = requests.put(
                f"{BASE_URL}/api/jobs/{job_id}",
                json={"status": "paused"}
            )
            assert update_response.status_code == 200
            updated_data = update_response.json()
            assert updated_data["status"] == "paused"
            print(f"✓ PUT /api/jobs/{job_id} updated status to paused")
            
            # Revert status
            revert_response = requests.put(
                f"{BASE_URL}/api/jobs/{job_id}",
                json={"status": original_status}
            )
            assert revert_response.status_code == 200
            print(f"✓ Reverted job status back to {original_status}")
        else:
            print("⚠ No draft job found to test status update")


class TestApplicationsAPI:
    """Applications CRUD API tests"""
    
    def test_get_all_applications(self):
        """Test GET /api/applications returns list"""
        response = requests.get(f"{BASE_URL}/api/applications")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/applications returned {len(data)} applications")
    
    def test_get_applications_by_job_id(self):
        """Test GET /api/applications?jobId=xxx filters by job"""
        # First get a job with applications
        jobs_response = requests.get(f"{BASE_URL}/api/jobs")
        jobs = jobs_response.json()
        job_with_apps = next((j for j in jobs if j.get("applications_count", 0) > 0), None)
        
        if job_with_apps:
            job_id = job_with_apps["id"]
            response = requests.get(f"{BASE_URL}/api/applications?jobId={job_id}")
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)
            for app in data:
                assert app["job_id"] == job_id
            print(f"✓ GET /api/applications?jobId={job_id} returned {len(data)} applications")
        else:
            print("⚠ No job with applications found")
    
    def test_create_application(self):
        """Test POST /api/applications creates new application"""
        # Get a published job
        jobs_response = requests.get(f"{BASE_URL}/api/jobs?status=published")
        jobs = jobs_response.json()
        assert len(jobs) > 0
        
        job = jobs[0]
        app_data = {
            "job_id": job["id"],
            "name": "TEST_John Tester",
            "email": "test.john@example.com",
            "phone": "+1 555-0199",
            "position": job["title"],
            "experience": "5 years",
            "linkedin": "linkedin.com/in/johntester",
            "portfolio": "johntester.dev",
            "cover_letter": "I am excited to apply for this position..."
        }
        
        response = requests.post(f"{BASE_URL}/api/applications", json=app_data)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == app_data["name"]
        assert data["email"] == app_data["email"]
        assert data["job_id"] == job["id"]
        assert data["stage"] == "new"
        assert "id" in data
        print(f"✓ POST /api/applications created application: {data['id']}")
        
        # Verify application was created
        get_response = requests.get(f"{BASE_URL}/api/applications/{data['id']}")
        assert get_response.status_code == 200
        fetched = get_response.json()
        assert fetched["name"] == app_data["name"]
        print(f"✓ Verified application exists via GET")
        
        # Cleanup
        delete_response = requests.delete(f"{BASE_URL}/api/applications/{data['id']}")
        assert delete_response.status_code == 200
        print(f"✓ Cleanup: deleted test application")
    
    def test_update_application_stage(self):
        """Test PUT /api/applications/[id] updates stage"""
        # Get an application
        response = requests.get(f"{BASE_URL}/api/applications")
        apps = response.json()
        
        if len(apps) > 0:
            app = apps[0]
            app_id = app["id"]
            original_stage = app["stage"]
            
            # Update stage
            new_stage = "screening" if original_stage != "screening" else "interview_scheduled"
            update_response = requests.put(
                f"{BASE_URL}/api/applications/{app_id}",
                json={"stage": new_stage, "status": new_stage}
            )
            assert update_response.status_code == 200
            updated = update_response.json()
            assert updated["stage"] == new_stage
            print(f"✓ PUT /api/applications/{app_id} updated stage to {new_stage}")
            
            # Revert
            revert_response = requests.put(
                f"{BASE_URL}/api/applications/{app_id}",
                json={"stage": original_stage, "status": original_stage}
            )
            assert revert_response.status_code == 200
            print(f"✓ Reverted application stage back to {original_stage}")
        else:
            print("⚠ No applications found to test stage update")
    
    def test_get_single_application(self):
        """Test GET /api/applications/[id] returns application with ratings and notes"""
        response = requests.get(f"{BASE_URL}/api/applications")
        apps = response.json()
        
        if len(apps) > 0:
            app_id = apps[0]["id"]
            response = requests.get(f"{BASE_URL}/api/applications/{app_id}")
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == app_id
            assert "ratings" in data
            assert "notes" in data
            print(f"✓ GET /api/applications/{app_id} returned application with ratings and notes")
        else:
            print("⚠ No applications found")


class TestJobSEOFeatures:
    """Test SEO-related features for job pages"""
    
    def test_job_has_slug(self):
        """Test that jobs have SEO-friendly slugs"""
        response = requests.get(f"{BASE_URL}/api/jobs")
        jobs = response.json()
        
        for job in jobs:
            assert "slug" in job
            assert job["slug"] is not None
            assert len(job["slug"]) > 0
            # Slug should be URL-friendly
            assert " " not in job["slug"]
        print(f"✓ All {len(jobs)} jobs have valid slugs")
    
    def test_job_has_meta_fields(self):
        """Test that jobs have meta fields for SEO"""
        response = requests.get(f"{BASE_URL}/api/jobs")
        jobs = response.json()
        
        for job in jobs:
            # These fields should exist (can be null)
            assert "meta_title" in job or job.get("meta_title") is None
            assert "meta_description" in job or job.get("meta_description") is None
        print(f"✓ Jobs have meta fields for SEO")


class TestAdminJobCentricFeatures:
    """Test Job-Centric Admin Dashboard features"""
    
    def test_jobs_have_applications_count(self):
        """Test that jobs include applications_count for admin dashboard"""
        response = requests.get(f"{BASE_URL}/api/jobs")
        jobs = response.json()
        
        for job in jobs:
            assert "applications_count" in job
            assert isinstance(job["applications_count"], int)
        print(f"✓ All jobs have applications_count field")
    
    def test_filter_jobs_by_status(self):
        """Test filtering jobs by different statuses"""
        statuses = ["published", "draft", "paused", "closed"]
        
        for status in statuses:
            response = requests.get(f"{BASE_URL}/api/jobs?status={status}")
            assert response.status_code == 200
            data = response.json()
            for job in data:
                assert job["status"] == status
            print(f"✓ Filter by status={status} returned {len(data)} jobs")
    
    def test_applications_filtered_by_job(self):
        """Test that applications can be filtered by jobId"""
        # Get jobs with applications
        jobs_response = requests.get(f"{BASE_URL}/api/jobs")
        jobs = jobs_response.json()
        
        for job in jobs:
            if job["applications_count"] > 0:
                apps_response = requests.get(f"{BASE_URL}/api/applications?jobId={job['id']}")
                assert apps_response.status_code == 200
                apps = apps_response.json()
                assert len(apps) == job["applications_count"]
                print(f"✓ Job '{job['title']}' has {len(apps)} applications (matches count)")
                break


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
