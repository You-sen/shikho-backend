/**
 * quiz-attempt controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::quiz-attempt.quiz-attempt', ({ strapi }) => ({

  async submit(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const { quizId, answers } = ctx.request.body;
    // answers expected as: [{ questionId: 1, selectedIndex: 2 }, ...]

    if (!quizId || !Array.isArray(answers)) {
      return ctx.badRequest('quizId and answers array are required');
    }

    // Fetch all questions for this quiz (source of truth for correct answers)
    const questions = await strapi.db.query('api::question.question').findMany({
      where: { quiz: quizId },
    });

    if (questions.length === 0) return ctx.notFound('Quiz has no questions');

    let score = 0;
    for (const question of questions) {
      const studentAnswer = answers.find((a: any) => a.questionId === question.id);
      if (studentAnswer && studentAnswer.selectedIndex === question.correctOptionIndex) {
        score++;
      }
    }

    const attempt = await strapi.db.query('api::quiz-attempt.quiz-attempt').create({
      data: {
        student: user.id,
        quiz: quizId,
        score,
        totalQuestions: questions.length,
        answers, // stored as JSON for later review
        submittedAt: new Date(),
      },
    });

    return {
      data: {
        attemptId: attempt.id,
        score,
        totalQuestions: questions.length,
        percentage: Math.round((score / questions.length) * 100),
      },
    };
  },

}));
