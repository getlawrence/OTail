# DocumentDB Cluster Parameter Group
resource "aws_docdb_cluster_parameter_group" "main" {
  family = "docdb4.0"
  name   = "otail-${var.environment}-params"

  parameter {
    name  = "tls"
    value = "enabled"
  }

  parameter {
    name  = "ttl_monitor"
    value = "enabled"
  }

  tags = {
    Environment = var.environment
    Terraform   = "true"
  }
}

# Generate a random password for DocumentDB
resource "random_password" "docdb" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# Store the password in Secrets Manager
resource "aws_secretsmanager_secret" "docdb" {
  name        = "otail-${var.environment}-docdb-credentials"
  description = "DocumentDB credentials for OTail ${var.environment}"
  kms_key_id  = aws_kms_key.main.arn

  tags = {
    Environment = var.environment
    Terraform   = "true"
  }
}

resource "aws_secretsmanager_secret_version" "docdb" {
  secret_id = aws_secretsmanager_secret.docdb.id
  secret_string = jsonencode({
    username = "otail_admin"
    password = random_password.docdb.result
    host     = aws_docdb_cluster.main.endpoint
    port     = 27017
    database = "otail"
  })
}

resource "aws_docdb_cluster" "main" {
  cluster_identifier              = "otail-${var.environment}-docdb"
  engine                          = "docdb"
  engine_version                  = "4.0.0"
  master_username                 = "otail_admin"
  master_password                 = random_password.docdb.result
  backup_retention_period         = var.environment == "prod" ? 14 : 1
  preferred_backup_window         = "03:00-04:00"
  deletion_protection             = var.environment == "prod"
  skip_final_snapshot             = var.environment != "prod"
  final_snapshot_identifier       = var.environment == "prod" ? "otail-${var.environment}-final-snapshot" : null
  db_cluster_parameter_group_name = aws_docdb_cluster_parameter_group.main.name
  db_subnet_group_name            = aws_docdb_subnet_group.main.name
  vpc_security_group_ids          = [aws_security_group.docdb.id]
  storage_encrypted               = true
  kms_key_id                      = aws_kms_key.main.arn

  tags = {
    Environment = var.environment
    Terraform   = "true"
  }
}

resource "aws_docdb_subnet_group" "main" {
  name       = "otail-${var.environment}-docdb-subnet"
  subnet_ids = module.vpc.database_subnets

  tags = {
    Environment = var.environment
    Terraform   = "true"
  }
}

resource "aws_docdb_cluster_instance" "main" {
  count              = var.environment == "prod" ? 3 : 1
  identifier         = "otail-${var.environment}-docdb-${count.index}"
  cluster_identifier = aws_docdb_cluster.main.id
  instance_class     = var.environment == "prod" ? "db.t4g.micro" : "db.t4g.medium"

  auto_minor_version_upgrade = true

  tags = {
    Environment = var.environment
    Terraform   = "true"
  }
}

# Security group for DocumentDB
resource "aws_security_group" "docdb" {
  name        = "otail-${var.environment}-docdb-sg"
  description = "Security group for DocumentDB cluster"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description     = "MongoDB from ECS tasks"
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  tags = {
    Name        = "otail-${var.environment}-docdb-sg"
    Environment = var.environment
  }
}

# Outputs for DocumentDB
output "docdb_endpoint" {
  description = "The DNS address of the DocumentDB cluster"
  value       = aws_docdb_cluster.main.endpoint
  sensitive   = true
}

output "docdb_reader_endpoint" {
  description = "A read-only endpoint for the DocumentDB cluster"
  value       = aws_docdb_cluster.main.reader_endpoint
  sensitive   = true
}

output "docdb_port" {
  description = "The port on which DocumentDB accepts connections"
  value       = 27017
}

# OpenSearch for logs and traces
resource "aws_opensearch_domain" "main" {
  domain_name    = "otail-${var.environment}"
  engine_version = "OpenSearch_2.9"

  cluster_config {
    instance_type          = "t3.small.search"
    instance_count         = var.environment == "prod" ? 3 : 1
    zone_awareness_enabled = var.environment == "prod"

    zone_awareness_config {
      availability_zone_count = var.environment == "prod" ? 3 : 2
    }
  }

  vpc_options {
    subnet_ids         = [module.vpc.private_subnets[0]]
    security_group_ids = [aws_security_group.opensearch.id]
  }

  ebs_options {
    ebs_enabled = true
    volume_size = 20
  }

  encrypt_at_rest {
    enabled    = true
    kms_key_id = aws_kms_key.main.arn
  }

  node_to_node_encryption {
    enabled = true
  }

  domain_endpoint_options {
    enforce_https       = true
    tls_security_policy = "Policy-Min-TLS-1-2-2019-07"
  }

  tags = {
    Environment = var.environment
    Terraform   = "true"
  }
}

# Security group for OpenSearch
resource "aws_security_group" "opensearch" {
  name        = "otail-${var.environment}-opensearch-sg"
  description = "Security group for OpenSearch domain"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description     = "HTTPS from ECS tasks"
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  tags = {
    Name        = "otail-${var.environment}-opensearch-sg"
    Environment = var.environment
  }
}
