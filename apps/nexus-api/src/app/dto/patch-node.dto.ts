import { IsString, IsOptional, IsObject } from 'class-validator';

export class PatchNodeDto {
  @IsString()
  nodeType!: string;

  @IsObject()
  currentNodeContent!: Record<string, any>;

  @IsString()
  instruction!: string;

  @IsOptional()
  @IsObject()
  siblingContext?: Record<string, any>;
}
