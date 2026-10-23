import { Activity, Team, User, Workout } from '../models/index.js';
import { Types } from 'mongoose';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw Object.assign(new Error('Activity input must be an object'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  if (
    typeof userId !== 'string' ||
    !Types.ObjectId.isValid(userId) ||
    typeof teamId !== 'string' ||
    !Types.ObjectId.isValid(teamId) ||
    typeof type !== 'string' ||
    !type.trim() ||
    typeof minutes !== 'number' ||
    !Number.isFinite(minutes) ||
    minutes <= 0
  ) {
    throw Object.assign(new Error('A valid userId, teamId, type, and positive minutes are required'), { status: 400 });
  }

  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user || !team) {
    throw Object.assign(new Error('The referenced user or team was not found'), { status: 404 });
  }

  return Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw Object.assign(new Error('Team input must be an object'), { status: 400 });
  }

  const { name, mascot, members = [] } = input as Record<string, unknown>;
  if (typeof name !== 'string' || !name.trim() || typeof mascot !== 'string' || !mascot.trim()) {
    throw Object.assign(new Error('A team name and mascot are required'), { status: 400 });
  }
  if (!Array.isArray(members) || members.some((member) => typeof member !== 'string' || !Types.ObjectId.isValid(member))) {
    throw Object.assign(new Error('Members must be valid user IDs'), { status: 400 });
  }

  const memberIds = [...new Set(members as string[])].map((memberId) => new Types.ObjectId(memberId));
  const memberCount = await User.countDocuments({ _id: { $in: memberIds } });
  if (memberCount !== memberIds.length) {
    throw Object.assign(new Error('One or more team members were not found'), { status: 404 });
  }

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members: memberIds });
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().select('_id name').lean(),
    Activity.aggregate<{ _id: Types.ObjectId; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const pointsByTeam = new Map(totals.map(({ _id, totalPoints }) => [_id.toString(), totalPoints]));

  return teams
    .map((team) => ({ teamName: team.name, totalPoints: pointsByTeam.get(team._id.toString()) ?? 0 }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const [recentActivity, workouts] = await Promise.all([
    Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean(),
    Workout.find().lean(),
  ]);
  const goal = user.fitnessGoal.trim().toLowerCase();
  const recentType = recentActivity?.type.trim().toLowerCase();
  const recentFocus = recentType === 'run' || recentType === 'cycle' ? 'endurance' : recentType;

  return workouts
    .map((workout) => {
      const focus = workout.focus.trim().toLowerCase();
      const matchesGoal = focus === goal;
      const matchesActivity = Boolean(recentFocus && focus === recentFocus);
      const reason = matchesGoal && matchesActivity
        ? `Matches your ${user.fitnessGoal} goal and recent ${recentActivity?.type} activity.`
        : matchesGoal
          ? `Matches your ${user.fitnessGoal} goal.`
          : matchesActivity
            ? `Builds on your recent ${recentActivity?.type} activity.`
            : `A complementary ${workout.focus} workout for your ${user.fitnessGoal} goal.`;

      return { ...workout, reason, score: Number(matchesGoal) * 2 + Number(matchesActivity) };
    })
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))
    .map(({ score: _score, ...workout }) => workout);
}

export { User };
