resource "aws_kms_key" "main" {
  description             = "KMS key for encrypting resources in OTail ${var.environment}"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    Environment = var.environment
    Terraform   = "true"
  }
}

resource "aws_secretsmanager_secret" "database_credentials" {
  name        = "otail-${var.environment}-db-credentials"
  description = "Database credentials for OTail ${var.environment}"
  kms_key_id  = aws_kms_key.main.arn

  tags = {
    Environment = var.environment
    Terraform   = "true"
  }
}

# Security group for ALB
resource "aws_security_group" "alb" {
  name        = "otail-${var.environment}-alb-sg"
  description = "Security group for ALB"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "WebSocket from anywhere"
    from_port   = 4320
    to_port     = 4320
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "otail-${var.environment}-alb-sg"
    Environment = var.environment
  }
}

# Security group for ECS tasks
resource "aws_security_group" "ecs_tasks" {
  name        = "otail-${var.environment}-ecs-tasks-sg"
  description = "Security group for ECS tasks"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description     = "Traffic from ALB"
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "otail-${var.environment}-ecs-tasks-sg"
    Environment = var.environment
  }
}
