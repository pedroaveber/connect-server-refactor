import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const algorithm = "aes-256-gcm";
const keyLength = 32; // 256 bits
const ivLength = 16; // 128 bits
const tagLength = 16; // 128 bits

export function decrypt(encryptedData: string, secretKey: string): string {
	const key = Buffer.from(secretKey.padEnd(keyLength, "0").slice(0, keyLength));

	const iv = Buffer.from(encryptedData.slice(0, ivLength * 2), "hex");
	const tag = Buffer.from(
		encryptedData.slice(ivLength * 2, (ivLength + tagLength) * 2),
		"hex",
	);
	const encrypted = encryptedData.slice((ivLength + tagLength) * 2);

	const decipher = createDecipheriv(algorithm, key, iv);
	decipher.setAuthTag(tag);

	let decrypted = decipher.update(encrypted, "hex", "utf8");
	decrypted += decipher.final("utf8");

	return decrypted;
}

export function encrypt(text: string, secretKey: string): string {
	const key = Buffer.from(secretKey.padEnd(keyLength, "0").slice(0, keyLength));
	const iv = randomBytes(ivLength);
	const cipher = createCipheriv(algorithm, key, iv);

	let encrypted = cipher.update(text, "utf8", "hex");
	encrypted += cipher.final("hex");

	const tag = cipher.getAuthTag();

	const result = iv.toString("hex") + tag.toString("hex") + encrypted;

	return result;
}
