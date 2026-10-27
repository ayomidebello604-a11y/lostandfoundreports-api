import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHash } from "node:crypto";
import {
  logoutService,
  verifyTokenService,
} from "../services/auth.services.ts";
import {
  findUserById,
  revokeRefreshToken,
  RotateRefreshToken,
  searchToken,
} from "../repositories/auth.repositories.ts";
import { generateToken } from "../utils/jwt.ts";

vi.mock("../repositories/auth.repositories.ts", () => ({
  revokeRefreshToken: vi.fn(),
  searchToken: vi.fn(),
  findUserById: vi.fn(),
  RotateRefreshToken: vi.fn(),
}));

vi.mock("../utils/jwt.ts", () => ({
  generateToken: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(revokeRefreshToken).mockResolvedValue(true);

  vi.mocked(searchToken).mockResolvedValue({
    user_id: "user-123",
    session_id: "session-456",
    token_hash: "hashed-old-token",
  });

  vi.mocked(findUserById).mockResolvedValue({
    id: "user-123",
    name: "Samad",
    email: "samad@example.com",
    role: "student",
    password_hash: "hashed-password",
  });

  vi.mocked(RotateRefreshToken).mockResolvedValue(undefined);
  vi.mocked(generateToken).mockResolvedValue("test-token");
});

describe("logoutService", () => {
  it("should return true when logout succeeds", async () => {
    const result = await logoutService("sample-refresh-token");

    expect(result).toBe(true);
    expect(revokeRefreshToken).toHaveBeenCalledOnce();
  });

  it("should throw an error when logout fails", async () => {
    vi.mocked(revokeRefreshToken).mockResolvedValue(false);

    await expect(logoutService("sample-refresh-token")).rejects.toThrow(
      "Unable to Logout User",
    );
  });
});

describe("verifyTokenService", () => {
  it("should return session information when verification succeeds", async () => {
    const result = await verifyTokenService("sample-test-token");

    expect(result).toEqual({
      sessionId: "session-456",
      new_accessToken: "test-token",
      refreshToken: expect.any(String),
      expiresAt: expect.any(Date),
    });

    expect(searchToken).toHaveBeenCalledOnce();

    expect(searchToken).toHaveBeenCalledWith(
      createHash("sha256").update("sample-test-token").digest("hex"),
    );

    expect(generateToken).toHaveBeenCalledWith("student", "user-123");

    expect(RotateRefreshToken).toHaveBeenCalledOnce();

    expect(RotateRefreshToken).toHaveBeenCalledWith(
      createHash("sha256").update("sample-test-token").digest("hex"),
      expect.any(String),
      expect.any(Date),
    );
  });

  it("should throw an error when the refresh token is invalid", async () => {
    vi.mocked(searchToken).mockResolvedValue(null);

    await expect(verifyTokenService("sample-test-token")).rejects.toThrow(
      "Unable to find corresponding token",
    );
  });

  it("should throw an error when the user cannot be found", async () => {
    vi.mocked(findUserById).mockResolvedValue(null);

    await expect(verifyTokenService("sample-test-token")).rejects.toThrow(
      "Unable to find User",
    );
  });
});
