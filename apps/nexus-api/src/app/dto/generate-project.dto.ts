import { IsString, MinLength } from 'class-validator';

export class GenerateProjectDto {
  @IsString()
  @MinLength(3, { message: 'prompt must be at least 3 characters' })
  prompt!: string;
}
