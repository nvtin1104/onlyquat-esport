import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tournament, TournamentDocument, Match, MatchDocument, CreateTournamentDto } from '@app/common';

@Injectable()
export class EsportsService {
  constructor(
    @InjectModel(Tournament.name) private tournamentModel: Model<TournamentDocument>,
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
  ) {}

  async findAll(): Promise<Tournament[]> {
    return this.tournamentModel.find().exec();
  }

  async findById(tournamentId: string): Promise<Tournament | null> {
    return this.tournamentModel.findById(tournamentId).exec();
  }

  async create(createTournamentDto: CreateTournamentDto): Promise<Tournament> {
    const tournament = new this.tournamentModel(createTournamentDto);
    return tournament.save();
  }

  /**
   * Cross-Service Query Example:
   * This demonstrates the benefit of shared MongoDB database.
   * We can use populate() to join User data (from identity-service collection)
   * without needing to make HTTP/NATS calls to identity-service.
   */
  async findMatchesByTournament(tournamentId: string) {
    return this.matchModel
      .find({ tournamentId })
      .populate('refereeId', 'username email firstName lastName') // Populate User from identity-service's collection
      .populate('team1Id', 'name tag logo')
      .populate('team2Id', 'name tag logo')
      .populate('winnerId', 'name tag')
      .exec();
  }

  /**
   * Another example: Get tournament with organizer details (User from identity-service)
   */
  async findTournamentWithOrganizer(tournamentId: string) {
    return this.tournamentModel
      .findById(tournamentId)
      .populate('organizerId', 'username email firstName lastName role') // User from identity-service
      .populate('teams', 'name tag logo')
      .exec();
  }
}
