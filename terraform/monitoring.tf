resource "aws_grafana_workspace" "main" {
  name                     = "otail-${var.environment}"
  account_access_type      = "CURRENT_ACCOUNT"
  authentication_providers = ["AWS_SSO"]
  permission_type          = "SERVICE_MANAGED"
  data_sources             = ["CLOUDWATCH", "PROMETHEUS", "AMAZON_OPENSEARCH_SERVICE"]

  vpc_configuration {
    subnet_ids         = module.vpc.private_subnets
    security_group_ids = [aws_security_group.grafana.id]
  }

  tags = {
    Environment = var.environment
    Terraform   = "true"
  }
}

# Security group for Grafana
resource "aws_security_group" "grafana" {
  name        = "otail-${var.environment}-grafana-sg"
  description = "Security group for Managed Grafana"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description     = "HTTPS from ECS tasks"
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "otail-${var.environment}-grafana-sg"
    Environment = var.environment
  }
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "frontend" {
  name              = "/ecs/otail-${var.environment}-frontend"
  retention_in_days = 30
  kms_key_id        = aws_kms_key.main.arn

  tags = {
    Environment = var.environment
    Terraform   = "true"
  }
}

resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/otail-${var.environment}-backend"
  retention_in_days = 30
  kms_key_id        = aws_kms_key.main.arn

  tags = {
    Environment = var.environment
    Terraform   = "true"
  }
}
