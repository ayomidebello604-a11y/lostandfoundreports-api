import {describe, it, expect} from 'vitest';
import request from 'supertest';
import app from '../app.ts';
 import { SignJWT } from "jose";

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
})
