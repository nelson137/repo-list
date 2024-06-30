import { z } from 'zod';

export const User = z.object({
    avatar_url: z.string().describe(`URL of the user's profile picture (AKA avatar).`),
    html_url: z.string().describe(`URL the user's profile.`),
    id: z.number().describe(`The user's ID.`),
    login: z.string().describe(`The user's username.`),
    name: z.string().describe(`The user's full name.`),
});

export type User = z.infer<typeof User>;
