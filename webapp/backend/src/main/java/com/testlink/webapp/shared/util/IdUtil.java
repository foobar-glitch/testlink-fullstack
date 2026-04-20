package com.testlink.webapp.shared.util;

import java.math.BigInteger;
import java.nio.ByteBuffer;
import java.util.UUID;

public final class IdUtil {

    private static final String ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    private static final BigInteger BASE = BigInteger.valueOf(62);

    private IdUtil() { /* Prevent instantiation */ }

    /**
     * Encodes a UUID to a Base62 string.
     */
    public static String toBase62(UUID uuid) {
        if (uuid == null) return null;

        // Convert UUID to a 128-bit positive number
        BigInteger number = new BigInteger(1, uuidToBytes(uuid));
        StringBuilder sb = new StringBuilder();

        while (number.compareTo(BigInteger.ZERO) > 0) {
            BigInteger[] quotientAndRemainder = number.divideAndRemainder(BASE);
            sb.append(ALPHABET.charAt(quotientAndRemainder[1].intValue()));
            number = quotientAndRemainder[0];
        }

        // Handle the case where the UUID is all zeros (rare but possible)
        return sb.isEmpty() ? "0" : sb.reverse().toString();
    }

    /**
     * Decodes a Base62 string back into a UUID.
     */
    public static UUID fromBase62(String str) {
        if (str == null || str.isEmpty()) return null;

        BigInteger result = BigInteger.ZERO;
        for (int i = 0; i < str.length(); i++) {
            int digit = ALPHABET.indexOf(str.charAt(i));
            if (digit == -1) {
                throw new IllegalArgumentException("Invalid character in Base62 string: " + str.charAt(i));
            }
            result = result.multiply(BASE).add(BigInteger.valueOf(digit));
        }

        byte[] bytes = result.toByteArray();
        byte[] uuidBytes = new byte[16];

        // BigInteger.toByteArray() might include a sign bit or be shorter than 16 bytes.
        // We need exactly 16 bytes for the UUID.
        int srcPos = Math.max(0, bytes.length - 16);
        int destPos = Math.max(0, 16 - bytes.length);
        int length = Math.min(16, bytes.length);

        System.arraycopy(bytes, srcPos, uuidBytes, destPos, length);

        ByteBuffer bb = ByteBuffer.wrap(uuidBytes);
        return new UUID(bb.getLong(), bb.getLong());
    }

    private static byte[] uuidToBytes(UUID uuid) {
        ByteBuffer bb = ByteBuffer.wrap(new byte[16]);
        bb.putLong(uuid.getMostSignificantBits());
        bb.putLong(uuid.getLeastSignificantBits());
        return bb.array();
    }
}