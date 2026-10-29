import { describe, it, expect, afterEach } from 'vitest';
import request from 'supertest';
import app from '../app.ts';
import { SignJWT } from "jose";
import { pool } from '../db/index.ts';

afterEach(async () => {
    // Clean up test reports so they don't accumulate between runs
    await pool.query("DELETE FROM lost_found_reports WHERE item_name = 'Black Box'");
});

describe("GET /route-does-not-exist", ()=>{
it("should return a not found error", async () => {
    const response = await request(app).get("/route-does-not-exist").expect(404)
    expect(response.status).toBe(404)
    expect(response.body).toEqual({
  message: "Route Not Found",
  requestedURL: "/route-does-not-exist"
})
})})

describe("GET /api/reports", () => {
    it("should return  reports object for authenticated user", async() => {
        const loginresponse = await request(app).post("/api/user/login").send({email:"user227@gmail.com",password:"testuser7password"})
        expect(loginresponse.status).toBe(200)
        const access_token = loginresponse.body.user.accessToken
        const reports = await request(app).get("/api/reports").set('Authorization', `Bearer ${access_token}`)
        expect(reports.status).toBe(200)
        expect(Array.isArray(reports.body)).toBe(true);

if (reports.body.length > 0) {
    expect(reports.body[0]).toHaveProperty("id");
    expect(reports.body[0]).toHaveProperty("student_id");
    expect(reports.body[0]).toHaveProperty("item_name");
}

    })

    it("should return error for an unathorized user", async () => {
        const reports = await request(app).get("/api/reports").expect(401)

        expect(reports.status).toBe(401)
    })
    it("should reject request for user with invalid token", async () => {
        const response = await request(app).get("/api/reports").set('Authorization', `Bearer ${"invalid-access-token"}`).expect(401)
       
    } )

   

it("should reject requests with an expired access token", async () => {
  
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const expiredToken = await new SignJWT({ userId: "123" })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(Math.floor((Date.now() - 60 * 1000) / 1000))
        .sign(secret);

   
    const response = await request(app)
        .get("/api/reports")
        .set("Authorization", `Bearer ${expiredToken}`);

   
    expect(response.status).toBe(401);
});
})
describe("POST /api/reports", () => {
    it("should return the valid return body of the new report", async () => {
        const loginResponse = await request(app).post("/api/user/login").send({ email: "user227@gmail.com", password: "testuser7password" })
        expect(loginResponse.status).toBe(200)
        const access_token = loginResponse.body.user.accessToken

        const newReport = await request(app)
            .post("/api/reports")
            .set("Authorization", `Bearer ${access_token}`)
            .send({
                student_id: "uge-13",
                item_name: "Black Box",
                description: "A big black box",
                type: "lost",
                category: "Accessories",
                location: "Library",
                contact_details: "Linked.me"
            })

        expect(newReport.status).toBe(201)
        expect(newReport.body).toHaveProperty("student_id", "uge-13")
        expect(newReport.body).toHaveProperty("item_name", "Black Box")
        expect(newReport.body).toHaveProperty("type", "lost")
    })

    it("should return the Bad response error from invalid input", async () => {
        const loginResponse = await request(app).post("/api/user/login").send({ email: "user227@gmail.com", password: "testuser7password" })
        expect(loginResponse.status).toBe(200)
        const access_token = loginResponse.body.user.accessToken

        const newReport = await request(app)
            .post("/api/reports")
            .set("Authorization", `Bearer ${access_token}`)
            .send({
                student_id: "uge-13",
                item_name: "Black Box",
                description: "A big black box",
                type: "stolen",
                category: "Accessories",
                location: "Library",
                contact_details: "Linked.me"
            }).expect(400)
            
        })

        it("should return the matching report if the id matches", async () => {
           const loginResponse = await request(app).post("/api/user/login").send({ email: "user227@gmail.com", password: "testuser7password" })
        expect(loginResponse.status).toBe(200)
        const access_token = loginResponse.body.user.accessToken
        
           const newReport = await request(app)
            .post("/api/reports")
            .set("Authorization", `Bearer ${access_token}`)
            .send({
                student_id: "uge-13",
                item_name: "Black Box",
                description: "A big black box",
                type: "lost",
                category: "Accessories",
                location: "Library",
                contact_details: "Linked.me"
            }).expect(201)
            const reportId = newReport.body.id
        const report = await request(app)
        .get(`/api/reports/${reportId}`)
        .set("Authorization", `Bearer ${access_token}`).expect(200)
        expect(report.body.id).toEqual(reportId)
        expect(report.body.type).toEqual("lost")
        expect(report.body.category).toEqual("Accessories")
        })

        it("should return 404-Notfound for a non-matching id report", async () => {
              const loginResponse = await request(app).post("/api/user/login").send({ email: "user227@gmail.com", password: "testuser7password" })
        expect(loginResponse.status).toBe(200)
        const access_token = loginResponse.body.user.accessToken

          const newReport = await request(app)
            .post("/api/reports")
            .set("Authorization", `Bearer ${access_token}`)
            .send({
                student_id: "uge-13",
                item_name: "Black Box",
                description: "A big black box",
                type: "lost",
                category: "Accessories",
                location: "Library",
                contact_details: "Linked.me"
            })

        expect(newReport.status).toBe(201)
        expect(newReport.body).toHaveProperty("student_id", "uge-13")
        expect(newReport.body).toHaveProperty("item_name", "Black Box")
        expect(newReport.body).toHaveProperty("type", "lost")

        const invalidReport = await request(app).get("/api/reports/999")
         .set("Authorization", `Bearer ${access_token}`).expect(404)
            expect(invalidReport.status).toBe(404)
        })
})

describe("PUT /api/reports", () => {
    it("should update the provided field on the report with matching id", async () => {
        const loginResponse = await request(app).post("/api/user/login").send({ email: "user227@gmail.com", password: "testuser7password" })
        expect(loginResponse.status).toBe(200)
        const access_token = loginResponse.body.user.accessToken

        const newReport = await request(app)
            .post("/api/reports")
            .set("Authorization", `Bearer ${access_token}`)
            .send({
                student_id: "uge-13",
                item_name: "Black Box",
                description: "A big black box",
                type: "lost",
                category: "Accessories",
                location: "Library",
                contact_details: "Linked.me"
            })
           
        expect(newReport.status).toBe(201)

        const id = newReport.body.id
       const updatedReport = await request(app)
  .put(`/api/reports/${id}`)
  .set("Authorization", `Bearer ${access_token}`)
  .send({
    student_id:"uge-13",
    item_name:"Black Box",
    description:"A big black box",
    type: "lost",
    category: "electronics",
    location: "ultramodern market",
    contact_details: "Linked.me"
  });


expect(updatedReport.status).toBe(200);
    })
    
      it("should return 404-Not-found for reports that doesn't exist", async () => {
        const loginResponse = await request(app).post("/api/user/login").send({ email: "user227@gmail.com", password: "testuser7password" })
        expect(loginResponse.status).toBe(200)
        const access_token = loginResponse.body.user.accessToken

        const newReport = await request(app)
            .post("/api/reports")
            .set("Authorization", `Bearer ${access_token}`)
            .send({
                student_id: "uge-13",
                item_name: "Black Box",
                description: "A big black box",
                type: "lost",
                category: "Accessories",
                location: "Library",
                contact_details: "Linked.me"
            })
           
        expect(newReport.status).toBe(201)

      
       const updatedReport = await request(app)
  .put("/api/reports/999")
  .set("Authorization", `Bearer ${access_token}`)
  .send({
    student_id:"uge-13",
    item_name:"Black Box",
    description:"A big black box",
    type: "lost",
    category: "electronics",
    location: "ultramodern market",
    contact_details: "Linked.me"
  });


expect(updatedReport.status).toBe(404);
    })
})

describe("DELETE /api/reports/id", () => {
    it("Should delete the report with matching id", async() => {
          const loginResponse = await request(app).post("/api/user/login").send({ email: "user227@gmail.com", password: "testuser7password" })
        expect(loginResponse.status).toBe(200)
        const access_token = loginResponse.body.user.accessToken

        const newReport = await request(app)
            .post("/api/reports")
            .set("Authorization", `Bearer ${access_token}`)
            .send({
                student_id: "uge-13",
                item_name: "Black Box",
                description: "A big black box",
                type: "lost",
                category: "Accessories",
                location: "Library",
                contact_details: "Linked.me"
            })
           
        expect(newReport.status).toBe(201)

        const id = newReport.body.id
        
        const deleteReport = await request(app).delete(`/api/reports/${id}`)
        .set("Authorization", `Bearer ${access_token}`)
        expect(deleteReport.status).toBe(200)
        const noReport = await request(app).get(`/api/reports/${id}`).expect(404)
        .set("Authorization", `Bearer ${access_token}`)
    })
})