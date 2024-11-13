<script setup>
import { createZodPlugin } from '@formkit/zod'
import { z } from 'zod'
import { ref, computed } from 'vue'

const regexPatterns = {
  lowercase: /[a-z]/,
  uppercase: /[A-Z]/,
  digit: /[0-9]/g,
  specialChar: /[!@#$%^&*(),.?":{}|<>]/g,
  commonWords: /password|12345|qwerty|admin/i,
};

const zodSchema = z.object({
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .refine((val) => !regexPatterns.commonWords.test(val), {
      message: "Password must not contain common words like 'password', '12345', 'qwerty', or 'admin'.",
    })
    .refine((val) => regexPatterns.lowercase.test(val), {
      message: "Password must contain at least one lowercase letter.",
    })
    .refine((val) => regexPatterns.uppercase.test(val), {
      message: "Password must contain at least one uppercase letter.",
    })
    .refine((val) => regexPatterns.digit.test(val), {
      message: "Password must contain at least one digit.",
    })
    .refine((val) => regexPatterns.specialChar.test(val), {
      message: "Password must contain at least one special character.",
    })
    .optional(),
});

const zodPlugin = createZodPlugin(zodSchema);

const password = ref('');
const score = computed(() => calculateScore(password.value));
const strength = computed(() => determineStrength(score.value));

const calculateScore = (password) => {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;

  if (regexPatterns.lowercase.test(password)) score += 1;
  if (regexPatterns.uppercase.test(password)) score += 1;

  const numberCount = (password.match(regexPatterns.digit) || []).length;
  score += Math.min(2, numberCount);

  const specialCharCount = (password.match(regexPatterns.specialChar) || []).length;
  score += Math.min(2, specialCharCount);

  if (password.length >= 12 && /[a-z]/.test(password) && /[A-Z]/.test(password) && numberCount > 0 && specialCharCount > 0) {
    score += 2;
  }

  if (regexPatterns.commonWords.test(password)) {
    score -= 2;
  }

  return Math.max(1, Math.min(score, 10));
}

const determineStrength = (score) => {
  if (score >= 8) return "strong";
  if (score >= 6) return "moderate";
  if (score >= 4) return "weak";
  return "very weak";
}

const rankClass = computed(() => {
  switch (strength.value) {
    case "strong": return "text-[#563A9C]";
    case "moderate": return "text-[#d179bf]";
    case "weak": return "text-[#ebae52]";
    default: return "text-[#992E30]";
  }
});
</script>

<template>
  <div class="flex items-center justify-center w-screen h-screen">
    <div
      class="flex flex-col items-center justify-center bg-[#8B5DFF]/50 w-[900px] h-auto aspect-[1.8/1] rounded-3xl p-10">
      <div class="flex flex-col items-center justify-center mb-10">
        <h1 class="font-semibold text-4xl text-[#563A9C] mb-2">Password Strength Testing Tool</h1>
        <h3 class="text-[#6A4EB0]">
          Think you have a strong password? Find out below.
        </h3>
      </div>
      <div class="bg-[#fffae0] w-full h-fit rounded-2xl p-10">
        <FormKit type="form" :plugins="[zodPlugin]" :actions="false" @keydown.enter.prevent>
          <FormKit type="text" name="password" placeholder="Evaluate your password" validation-visibility="dirty"
            input-class="w-full h-[40px] text-lg bg-[#E1E1E1] rounded-2xl text-[#563A9C] focus:outline-[#563A9C]/75 p-6"
            message-class="text-[#992E30]" outer-class="mb-10" v-model="password" />
        </FormKit>
        <div class="flex items-center justify-between w-full">
          <div class="flex flex-col items-start justify-center">
            <div class="text-[#563A9C]">Your password strength:</div>
            <div :class="rankClass" class="font-bold">{{ strength }}</div>
          </div>
          <div class="flex flex-col items-start justify-center">
            <div class="text-[#563A9C]">Score:</div>
            <div :class="rankClass" class="font-bold">{{ score }} / 10</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
