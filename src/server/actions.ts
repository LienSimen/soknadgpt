import { type Job, type CoverLetter, type User, type LnPayment } from "wasp/entities";
import { HttpError } from "wasp/server";
import axios from 'axios';
import {
  type GenerateCoverLetter,
  type CreateJob,
  type UpdateCoverLetter,
  type EditCoverLetter,
  type GenerateEdit,
  type UpdateJob,
  type UpdateUser,
  type DeleteJob,
  type StripePayment,
  type StripeGpt4Payment,
  type StripeCreditsPayment,
  type ScrapeJob,
} from "wasp/server/operations";
import fetch from 'node-fetch';
import Stripe from 'stripe';
import * as cheerio from 'cheerio'; // Added cheerio import

const stripe = new Stripe(process.env.STRIPE_KEY!, {
  apiVersion: '2023-08-16',
});

const DOMAIN = process.env.WASP_WEB_CLIENT_URL || 'http://localhost:3000';

const gptConfig = {
  completeCoverLetter: `Write a cover letter as the job applicant themselves. Write exactly how they would write it - not like an AI describing them.

Write in the same language as the job description. Sound like a real person who is genuinely interested in this specific job.

CRITICAL - Avoid AI detection:
- Write as "I" not "he/she" - you ARE the applicant
- Include minor grammatical imperfections and casual language
- Don't be overly perfect or polished
- Use natural expressions and colloquialisms
- Show real personality and enthusiasm
- Vary sentence structure naturally
- Include hesitations or corrections like real speech
- Use everyday expressions and slang where appropriate
- Write like you speak, not like formal writing

Write naturally about:
- Why this specific job excites you
- How your actual experience connects to what they need
- Specific examples from your background
- Your contact info
- Genuine interest in next steps

Don't follow a template. Write like you're telling a friend why you want this job.`,

  coverLetterWithAWittyRemark: `Write a cover letter as the job applicant themselves. Write exactly how they would write it - not like an AI describing them. End with a natural, job-related joke.

Write in the same language as the job description. Sound like a real person who is genuinely interested in this specific job.

CRITICAL - Avoid AI detection:
- Write as "I" not "he/she" - you ARE the applicant
- Include minor grammatical imperfections and casual language
- Don't be overly perfect or polished
- Use natural expressions and colloquialisms
- Show real personality and enthusiasm
- Vary sentence structure naturally
- Include hesitations or corrections like real speech
- Use everyday expressions and slang where appropriate
- Write like you speak, not like formal writing

Write naturally about:
- Why this specific job excites you
- How your actual experience connects to what they need
- Specific examples from your background
- Your contact info
- A natural joke that relates to the job/industry (not forced)
- Genuine interest in next steps

Don't follow a template. Write like you're telling a friend why you want this job.`,

  ideasForCoverLetter: `Generate natural, human-sounding ideas for a cover letter. Focus on genuine connections between the applicant's experience and job requirements. Avoid generic suggestions.`,
};

function buildEnhancedPrompt(basePrompt: string, options?: CoverLetterOptionsData): string {
  let enhancedPrompt = basePrompt;

  // Always add anti-AI-detection instructions
  enhancedPrompt += "\n\nANTI-AI-DETECTION REQUIREMENTS:\n";
  enhancedPrompt += "- Use natural expressions and idioms in the same language as the job description\n";
  enhancedPrompt += "- Include minor grammatical imperfections that humans make\n";
  enhancedPrompt += "- Use contractions and informal language where appropriate\n";
  enhancedPrompt += "- Avoid overly polished or perfect sentence structures\n";
  enhancedPrompt += "- Include personal touches and authentic reactions\n";
  enhancedPrompt += "- Use varied sentence starters - avoid repetitive patterns\n";
  enhancedPrompt += "- Write with genuine emotion and personality\n";
  enhancedPrompt += "- Don't use bullet points or structured formatting\n";
  enhancedPrompt += "- Write in flowing paragraphs like natural speech\n";
  enhancedPrompt += "- Include hesitations, corrections, and natural speech patterns\n";
  enhancedPrompt += "- Add small typos or informal spellings that humans naturally make\n";
  enhancedPrompt += "- Use regional expressions and local slang appropriate to the language\n";
  enhancedPrompt += "- Include incomplete thoughts or sentences that trail off naturally\n";
  enhancedPrompt += "- Mix formal and informal registers within the same paragraph\n";
  enhancedPrompt += "- Add personal interjections like 'forresten' or 'altså' in Norwegian\n";
  enhancedPrompt += "- Use run-on sentences occasionally, like people do when excited\n";
  enhancedPrompt += "- Include self-corrections like 'eller rettere sagt' or similar phrases\n";
  enhancedPrompt += "- Jump between topics naturally, like real conversations do\n";
  enhancedPrompt += "- Include specific personal opinions that aren't perfectly balanced\n";
  enhancedPrompt += "- Reference current trends or recent events when relevant\n";
  enhancedPrompt += "- Let some thoughts feel incomplete or trail off mid-idea\n";
  enhancedPrompt += "- Mix sentence lengths dramatically - very short. Then longer rambling ones.\n";

  if (!options) return enhancedPrompt;

  const styleModifications: string[] = [];
  const contentModifications: string[] = [];

  // Style options
  if (options.styleOptions.conversationalTone) {
    styleModifications.push("Write like you're talking to a friend - use casual expressions and natural speech patterns in the same language as the job description");
  }

  if (options.styleOptions.varySentenceLength) {
    styleModifications.push("Mix very short sentences with longer ones. Some sentences should be fragments. Others should ramble a bit like real speech.");
  }

  if (options.styleOptions.addPersonalAnecdote) {
    styleModifications.push("Share a specific, personal story from your actual experience. Make it feel real and authentic, not generic.");
  }

  // Content options
  if (options.contentOptions.useIndustryTerminology) {
    contentModifications.push("Use specific technical terms from the industry, but explain them naturally like someone who actually works in the field");
  }

  if (options.contentOptions.includeConfidentUncertainty) {
    contentModifications.push("Show you're confident but not arrogant. Admit what you don't know while being excited to learn. Use natural phrases that show humility.");
  }

  if (options.contentOptions.addRhetoricalQuestion) {
    contentModifications.push("Ask a genuine question that shows you've thought about the role. Make it sound like something you'd actually wonder about, not a textbook rhetorical question.");
  }

  // Anti-AI options
  const antiAiModifications: string[] = [];
  
  if (options.antiAiOptions.addTyposAndInformalSpelling) {
    antiAiModifications.push("Include small typos and informal spellings that humans naturally make - don't be perfect");
  }

  if (options.antiAiOptions.useRegionalExpressions) {
    antiAiModifications.push("Use regional expressions and local slang appropriate to the language and culture");
  }

  if (options.antiAiOptions.includeIncompleteThoughts) {
    antiAiModifications.push("Include incomplete thoughts or sentences that trail off naturally, like real speech");
  }

  if (options.antiAiOptions.mixFormalInformalRegisters) {
    antiAiModifications.push("Mix formal and informal language within the same paragraph, like people naturally do");
  }

  if (options.antiAiOptions.addPersonalInterjections) {
    antiAiModifications.push("Add personal interjections and filler words like 'forresten', 'altså', 'liksom' in Norwegian");
  }

  if (options.antiAiOptions.useRunOnSentences) {
    antiAiModifications.push("Use run-on sentences occasionally, like people do when they get excited about something");
  }

  if (options.antiAiOptions.includeSelfCorrections) {
    antiAiModifications.push("Include self-corrections like 'eller rettere sagt' or similar phrases that show natural thinking");
  }

  if (options.antiAiOptions.jumpBetweenTopics) {
    antiAiModifications.push("Jump between topics naturally, like real conversations do - don't be too structured");
  }

  if (options.antiAiOptions.includePersonalOpinions) {
    antiAiModifications.push("Include specific personal opinions that aren't perfectly balanced - show genuine preferences");
  }

  if (options.antiAiOptions.referenceCurrentTrends) {
    antiAiModifications.push("Reference current trends or recent events when relevant to the job or industry");
  }

  // Add modifications to the prompt
  if (styleModifications.length > 0) {
    enhancedPrompt += "\n\nSTYLE REQUIREMENTS:\n" + styleModifications.map(mod => `- ${mod}`).join("\n");
  }

  if (contentModifications.length > 0) {
    enhancedPrompt += "\n\nCONTENT REQUIREMENTS:\n" + contentModifications.map(mod => `- ${mod}`).join("\n");
  }

  if (antiAiModifications.length > 0) {
    enhancedPrompt += "\n\nANTI-AI PERSONALIZATION:\n" + antiAiModifications.map(mod => `- ${mod}`).join("\n");
  }

  return enhancedPrompt;
}

type CoverLetterOptionsData = {
  styleOptions: {
    conversationalTone: boolean;
    varySentenceLength: boolean;
    addPersonalAnecdote: boolean;
  };
  contentOptions: {
    useIndustryTerminology: boolean;
    includeConfidentUncertainty: boolean;
    addRhetoricalQuestion: boolean;
  };
  antiAiOptions: {
    addTyposAndInformalSpelling: boolean;
    useRegionalExpressions: boolean;
    includeIncompleteThoughts: boolean;
    mixFormalInformalRegisters: boolean;
    addPersonalInterjections: boolean;
    useRunOnSentences: boolean;
    includeSelfCorrections: boolean;
    jumpBetweenTopics: boolean;
    includePersonalOpinions: boolean;
    referenceCurrentTrends: boolean;
  };
};

type CoverLetterPayload = Pick<CoverLetter, 'title' | 'jobId'> & {
  content: string;
  description: string;
  isCompleteCoverLetter: boolean;
  includeWittyRemark: boolean;
  temperature: number;
  gptModel: string;
  lnPayment?: LnPayment;
  coverLetterOptions?: CoverLetterOptionsData;
};

type OpenAIResponse = {
  id: string;
  object: string;
  created: number;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: [
    {
      index: number;
      message: {
        role: string;
        content: string;
      };
      finish_reason: string;
    }
  ];
  error?: {
    message?: string;
  };
};

async function checkIfUserPaid({ context, lnPayment }: { context: any; lnPayment?: LnPayment }) {
  if (!context.user.hasPaid && !context.user.credits && !context.user.isUsingLn) {
    throw new HttpError(402, 'User must pay to continue');
  }
  if (context.user.subscriptionStatus === 'past_due') {
    throw new HttpError(402, 'Your subscription is past due. Please update your payment method.');
  }
  if (context.user.isUsingLn) {
    let invoiceStatus;
    if (lnPayment) {
      const lnPaymentInDB = await context.entities.LnPayment.findUnique({
        where: {
          pr: lnPayment.pr,
        },
      });
      invoiceStatus = lnPaymentInDB?.status;
    }
    console.table({ lnPayment, invoiceStatus });
    if (invoiceStatus !== 'success') {
      throw new HttpError(402, 'Your lightning payment has not been paid');
    }
  }
}

export const generateCoverLetter: GenerateCoverLetter<CoverLetterPayload, CoverLetter> = async (
  { jobId, title, content, description, isCompleteCoverLetter, includeWittyRemark, temperature, gptModel, lnPayment, coverLetterOptions },
  context
) => {
  if (!context.user) {
    throw new HttpError(401);
  }
  await checkIfUserPaid({ context, lnPayment })

  let command;
  if (isCompleteCoverLetter) {
    const baseCommand = includeWittyRemark ? gptConfig.coverLetterWithAWittyRemark : gptConfig.completeCoverLetter;
    command = buildEnhancedPrompt(baseCommand, coverLetterOptions);
  } else {
    command = buildEnhancedPrompt(gptConfig.ideasForCoverLetter, coverLetterOptions);
  }

  console.log(' gpt model: ', gptModel);

  const payload = {
    model: gptModel,
    messages: [
      {
        role: 'system',
        content: command,
      },
      {
        role: 'user',
        content: `My Resume: ${content}. Job title: ${title} Job Description: ${description}.`,
      },
    ],
    temperature,
  };

  let json: OpenAIResponse;

  try {
    if (!context.user.hasPaid && !context.user.credits && !context.user.isUsingLn) {
      throw new HttpError(402, 'User has not paid or is out of credits');
    } else if (context.user.credits && !context.user.hasPaid) {
      console.log('decrementing credits \n\n');
      await context.entities.User.update({
        where: { id: context.user.id },
        data: {
          credits: {
            decrement: 1,
          },
        },
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
      },
      method: 'POST',
      body: JSON.stringify(payload),
    });

    json = (await response.json()) as OpenAIResponse;

    if (json?.error) throw new HttpError(500, json?.error?.message || 'Something went wrong');

    return context.entities.CoverLetter.create({
      data: {
        title,
        content: json?.choices[0].message.content,
        tokenUsage: json?.usage.completion_tokens,
        user: { connect: { id: context.user.id } },
        job: { connect: { id: jobId } },
      },
    });
  } catch (error: any) {
    if (!context.user.hasPaid && error?.statusCode != 402) {
      await context.entities.User.update({
        where: { id: context.user.id },
        data: {
          credits: {
            increment: 1,
          },
        },
      });
    }
    console.error(error);
    throw new HttpError(error.statusCode || 500, error.message || 'Something went wrong');
  }
};

export const generateEdit: GenerateEdit<
  { content: string; improvement: string; lnPayment?: LnPayment },
  string
> = async ({ content, improvement, lnPayment }, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }
  await checkIfUserPaid({ context, lnPayment });

  let command;
  command = `You are a cover letter editor. You will be given a piece of isolated text from within a cover letter and told how you can improve it. Only respond with the revision. Make sure the revision is in the same language as the given isolated text.`;

  const payload = {
    model: context.user.gptModel === 'gpt-4' || context.user.gptModel === 'gpt-4o' ? 'gpt-4o' : 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: command,
      },
      {
        role: 'user',
        content: `Isolated text from within cover letter: ${content}. It should be improved by making it more: ${improvement}`,
      },
    ],
    temperature: 0.5,
  };

  let json: OpenAIResponse;

  try {
    if (!context.user.hasPaid && !context.user.credits && !context.user.isUsingLn) {
      throw new HttpError(402, 'User has not paid or is out of credits');
    } else if (context.user.credits && !context.user.hasPaid) {
      console.log('decrementing credits \n\n');
      await context.entities.User.update({
        where: { id: context.user.id },
        data: {
          credits: {
            decrement: 1,
          },
        },
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
      },
      method: 'POST',
      body: JSON.stringify(payload),
    });

    json = (await response.json()) as OpenAIResponse;
    if (json?.choices[0].message.content.length) {
      return json?.choices[0].message.content;
    } else {
      throw new HttpError(500, 'GPT returned an empty response');
    }
  } catch (error: any) {
    if (!context.user.hasPaid && error?.statusCode != 402) {
      await context.entities.User.update({
        where: { id: context.user.id },
        data: {
          credits: {
            increment: 1,
          },
        },
      });
    }
    console.error(error);
    throw new HttpError(error.statusCode || 500, error.message || 'Something went wrong');
  }
};

export type JobPayload = Pick<Job, 'title' | 'company' | 'location' | 'description'>;

export const createJob: CreateJob<JobPayload, Job> = ({ title, company, location, description }, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  return context.entities.Job.create({
    data: {
      title,
      description,
      location,
      company,
      user: { connect: { id: context.user.id } },
    },
  });
};

export type UpdateJobPayload = Pick<Job, 'id' | 'title' | 'company' | 'location' | 'description' | 'isCompleted'>;

export const updateJob: UpdateJob<UpdateJobPayload, Job> = (
  { id, title, company, location, description, isCompleted },
  context
) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  return context.entities.Job.update({
    where: {
      id,
    },
    data: {
      title,
      description,
      location,
      company,
      isCompleted,
    },
  });
};

export type UpdateCoverLetterPayload = Pick<Job, 'id' | 'description'> &
  Pick<CoverLetter, 'content'> & {
    isCompleteCoverLetter: boolean;
    includeWittyRemark: boolean;
    temperature: number;
    gptModel: string;
    lnPayment?: LnPayment;
    coverLetterOptions?: CoverLetterOptionsData;
  };

export const updateCoverLetter: UpdateCoverLetter<UpdateCoverLetterPayload, string> = async (
  { id, description, content, isCompleteCoverLetter, includeWittyRemark, temperature, gptModel, lnPayment, coverLetterOptions },
  context
) => {
  if (!context.user) {
    throw new HttpError(401);
  }
  await checkIfUserPaid({ context, lnPayment });

  const job = await context.entities.Job.findFirst({
    where: {
      id,
      user: { id: context.user.id },
    },
  });

  if (!job) {
    throw new HttpError(404, 'Job not found');
  }

  const coverLetter = await generateCoverLetter(
    {
      jobId: id,
      title: job.title,
      content,
      description: job.description,
      isCompleteCoverLetter,
      includeWittyRemark,
      temperature,
      gptModel,
      lnPayment,
      coverLetterOptions,
    },
    context
  );

  await context.entities.Job.update({
    where: {
      id,
    },
    data: {
      description,
      coverLetter: { connect: { id: coverLetter.id } },
    },
  });

  return coverLetter.id;
};

export const editCoverLetter: EditCoverLetter<{ coverLetterId: string; content: string }, CoverLetter> = (
  { coverLetterId, content },
  context
) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  return context.entities.CoverLetter.update({
    where: {
      id: coverLetterId,
    },
    data: {
      content,
    },
  });
};

export const deleteJob: DeleteJob<{ jobId: string }, { count: number }> = ({ jobId }, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }
  if (!jobId) {
    throw new HttpError(401);
  }

  return context.entities.Job.deleteMany({
    where: {
      id: jobId,
      userId: context.user.id,
    },
  });
};

type UpdateUserArgs = Partial<Pick<User, 'id' | 'notifyPaymentExpires' | 'gptModel'>>;
type UserWithoutPassword = Omit<User, 'password'>;

export const updateUser: UpdateUser<UpdateUserArgs, UserWithoutPassword> = async (
  { notifyPaymentExpires, gptModel },
  context
) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  return context.entities.User.update({
    where: {
      id: context.user.id,
    },
    data: {
      notifyPaymentExpires,
      gptModel,
    },
    select: {
      id: true,
      email: true,
      username: true,
      hasPaid: true,
      datePaid: true,
      notifyPaymentExpires: true,
      checkoutSessionId: true,
      stripeId: true,
      credits: true,
      gptModel: true,
      isUsingLn: true,
      subscriptionStatus: true
    },
  });
};

type UpdateUserResult = Pick<User, 'id' | 'email' | 'hasPaid'>;

function dontUpdateUser(user: UserWithoutPassword): Promise<UserWithoutPassword> {
  return new Promise((resolve) => {
    resolve(user);
  });
}

type StripePaymentResult = {
  sessionUrl: string | null;
  sessionId: string;
};

export const stripePayment: StripePayment<void, StripePaymentResult> = async (_args, context) => {
  if (!context.user || !context.user.email) {
    throw new HttpError(401, 'User or email not found');
  }
  let customer: Stripe.Customer;
  const stripeCustomers = await stripe.customers.list({
    email: context.user.email,
  });
  if (!stripeCustomers.data.length) {
    console.log('creating customer');
    customer = await stripe.customers.create({
      email: context.user.email,
    });
  } else {
    console.log('using existing customer');
    customer = stripeCustomers.data[0];
  }

  const session: Stripe.Checkout.Session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: process.env.PRODUCT_PRICE_ID!,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${DOMAIN}/checkout?success=true`,
    cancel_url: `${DOMAIN}/checkout?canceled=true`,
    automatic_tax: { enabled: true },
    customer_update: {
      address: 'auto',
    },
    customer: customer.id,
  });

  await context.entities.User.update({
    where: {
      id: context.user.id,
    },
    data: {
      checkoutSessionId: session?.id ?? null,
      stripeId: customer.id ?? null,
    },
  });

  return new Promise((resolve, reject) => {
    if (!session) {
      reject(new HttpError(402, 'Could not create a Stripe session'));
    } else {
      resolve({
        sessionUrl: session.url,
        sessionId: session.id,
      });
    }
  });
};

export const stripeGpt4Payment: StripeGpt4Payment<void, StripePaymentResult> = async (_args, context) => {
  if (!context.user || !context.user.email) {
    throw new HttpError(401, 'User or email not found');
  }
  let customer: Stripe.Customer;
  const stripeCustomers = await stripe.customers.list({
    email: context.user.email,
  });
  if (!stripeCustomers.data.length) {
    console.log('creating customer');
    customer = await stripe.customers.create({
      email: context.user.email,
    });
  } else {
    console.log('using existing customer');
    customer = stripeCustomers.data[0];
  }

  const session: Stripe.Checkout.Session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: process.env.GPT4_PRICE_ID!,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${DOMAIN}/checkout?success=true`,
    cancel_url: `${DOMAIN}/checkout?canceled=true`,
    automatic_tax: { enabled: true },
    customer_update: {
      address: 'auto',
    },
    customer: customer.id,
  });

  await context.entities.User.update({
    where: {
      id: context.user.id,
    },
    data: {
      checkoutSessionId: session?.id ?? null,
      stripeId: customer.id ?? null,
    },
  });

  return new Promise((resolve, reject) => {
    if (!session) {
      reject(new HttpError(402, 'Could not create a Stripe session'));
    } else {
      resolve({
        sessionUrl: session.url,
        sessionId: session.id,
      });
    }
  });
};

export const stripeCreditsPayment: StripeCreditsPayment<void, StripePaymentResult> = async (_args, context) => {
  if (!context.user || !context.user.email) {
    throw new HttpError(401, 'User or email not found');
  }
  let customer: Stripe.Customer;
  const stripeCustomers = await stripe.customers.list({
    email: context.user.email,
  });
  if (!stripeCustomers.data.length) {
    console.log('creating customer');
    customer = await stripe.customers.create({
      email: context.user.email,
    });
  } else {
    console.log('using existing customer');
    customer = stripeCustomers.data[0];
  }

  const session: Stripe.Checkout.Session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: process.env.PRODUCT_CREDITS_PRICE_ID!,
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${DOMAIN}/checkout?credits=true`,
    cancel_url: `${DOMAIN}/checkout?canceled=true`,
    automatic_tax: { enabled: true },
    customer_update: {
      address: 'auto',
    },
    customer: customer.id,
  });

  await context.entities.User.update({
    where: {
      id: context.user.id,
    },
    data: {
      stripeId: customer.id ?? null,
    },
  });

  return new Promise((resolve, reject) => {
    if (!session) {
      reject(new HttpError(402, 'Could not create a Stripe session'));
    } else {
      resolve({
        sessionUrl: session.url,
        sessionId: session.id,
      });
    }
  });
};

type ScrapedJob = {
  title: string;
  company: string;
  location: string;
  description: string;
};

export const scrapeJob = async (url: string): Promise<ScrapedJob> => {
  try {
    // 1. Fetch the webpage content with appropriate headers
    console.log("Fetching URL:", url);
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    // 2. Load HTML into cheerio for parsing
    const $ = cheerio.load(data);
    console.log("HTML loaded successfully.");

    // 3. Extract structured data from the page
    const title = $("h1").first().text().trim();
    const descriptionParts: string[] = [];

    // Extract Company: Find the first paragraph in the main article that isn't the title
    let company = "";
    $("article p").each((i, el) => {
      const text = $(el).text().trim();
      if (text && text !== title && !company) {
        company = text;
      }
    });

    // Extract Location: Look for a specific label or fallback to a list item
    let location = "Not specified";
    const locationLabel = $('span:contains("Sted")');
    if (locationLabel.length) {
      location = locationLabel.next().text().trim();
    } else {
      $("li").each((i, el) => {
        const label = $(el).find("span").first().text().trim();
        if (label.startsWith("Sted")) {
          const textNodes = $(el)
            .contents()
            .filter((_, node) => node.type === "text");
          const locText = textNodes
            .map((_, node) => $(node).text().trim())
            .get()
            .join(" ")
            .replace(/^:/, "")
            .trim();
          if (locText) {
            location = locText;
            return false; // Exit loop once found
          }
        }
      });
    }

    // --- Assemble Job Description ---

    // Extract main description text from the first few paragraphs
    const mainDesc: string[] = [];
    $("article p").each((i, el) => {
      if (mainDesc.length < 5) {
        const text = $(el).text().trim();
        if (text && text !== "Ønskede kvalifikasjoner:") {
          mainDesc.push(text);
        }
      }
    });
    if (mainDesc.length) {
      descriptionParts.push(mainDesc.join("\n"));
    }

    // Extract "Om arbeidsgiveren" (About the employer) section
    const aboutHeader = $('h2.t3:contains("Om arbeidsgiveren")');
    if (aboutHeader.length) {
      const aboutText = aboutHeader.next(".import-decoration").text().trim();
      if (aboutText) {
        descriptionParts.push("Om arbeidsgiveren:\n" + aboutText);
      }
    }

    // Extract "Ønskede kvalifikasjoner" (Desired qualifications) section
    const kvalStrong = $("strong:contains('Ønskede kvalifikasjoner')");
    if (kvalStrong.length) {
      const kvalifikasjoner: string[] = [];
      let nextEl = kvalStrong.parent().next();
      while (nextEl.length && !nextEl.is("strong, h1, h2, h3, h4, h5, h6")) {
        if (nextEl.is("p")) {
          const txt = nextEl.text().trim();
          if (txt) kvalifikasjoner.push(txt);
        }
        nextEl = nextEl.next();
      }
      if (kvalifikasjoner.length) {
        descriptionParts.push(
          "Ønskede kvalifikasjoner:\n" + kvalifikasjoner.join("\n")
        );
      }
    }

    // Extract "Ferdigheter" (Skills) from a list
    const ferdHeader = $("h2.t3").filter((_, el) =>
      $(el).find("div").first().text().trim().includes("Ferdigheter")
    );
    if (ferdHeader.length) {
      const skills: string[] = [];
      ferdHeader
        .next("ul")
        .find("span")
        .each((_, el) => {
          const skill = $(el).text().trim();
          if (skill) skills.push(skill);
        });
      if (skills.length) {
        descriptionParts.push("Ferdigheter:\n" + skills.join(", "));
      }
    }

    // Extract key-value job info list
    const jobInfoList = $("ul.space-y-6");
    if (jobInfoList.length) {
      const items: string[] = [];
      jobInfoList.find("li").each((i, el) => {
        const label = $(el)
          .find("span.font-bold")
          .text()
          .trim()
          .replace(/[:：]+$/, "");
        const value = $(el)
          .clone()
          .children("span.font-bold")
          .remove()
          .end()
          .text()
          .trim();
        if (label && value) {
          items.push(`${label}: ${value}`);
        }
      });
      if (items.length) {
        descriptionParts.push("Jobbinfo:\n" + items.join(" | "));
      }
    }

    // 4. Finalize and return structured data
    console.log("Data extraction complete.");
    const jobDescription = descriptionParts
      .join("\n\n")
      .replace(/(\n\s*){3,}/g, "\n\n")
      .trim();

    return {
      title: title || "Title not found",
      company: company || "Company not found",
      location: location,
      description: jobDescription || "No description available",
    };
  } catch (error: any) {
    console.error(`Error scraping ${url}:`, error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
    }
    throw new Error(`Failed to scrape ${url}. ${error.message}`);
  }
};