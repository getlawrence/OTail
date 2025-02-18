# Application Load Balancer for backend service
resource "aws_lb" "backend" {
  name               = "otail-${var.environment}-backend"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = module.vpc.public_subnets

  enable_deletion_protection = var.environment == "prod"

  access_logs {
    bucket  = local.lb_logs_bucket.id
    prefix  = "backend-lb"
    enabled = true
  }

  tags = {
    Environment = var.environment
    Terraform   = "true"
  }
}

# S3 bucket for ALB access logs
resource "aws_s3_bucket" "lb_logs" {
  bucket = "otail-${var.environment}-lb-logs-${data.aws_caller_identity.current.account_id}"

  # For production, we'll create a separate bucket with prevent_destroy
  count = var.environment == "prod" ? 0 : 1

  tags = {
    Environment = var.environment
    Terraform   = "true"
  }
}

# Production S3 bucket with prevent_destroy
resource "aws_s3_bucket" "lb_logs_prod" {
  bucket = "otail-prod-lb-logs-${data.aws_caller_identity.current.account_id}"
  count  = var.environment == "prod" ? 1 : 0

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Environment = "prod"
    Terraform   = "true"
  }
}

locals {
  lb_logs_bucket = var.environment == "prod" ? aws_s3_bucket.lb_logs_prod[0] : aws_s3_bucket.lb_logs[0]
}

resource "aws_s3_bucket_policy" "lb_logs" {
  bucket = local.lb_logs_bucket.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${var.elb_account_id[var.aws_region]}:root"
        }
        Action   = "s3:PutObject"
        Resource = "${local.lb_logs_bucket.arn}/*"
      }
    ]
  })
}

# ALB Listener for HTTPS
resource "aws_lb_listener" "backend_https" {
  load_balancer_arn = aws_lb.backend.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate.main.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}

# ALB Listener for HTTP (redirects to HTTPS)
resource "aws_lb_listener" "backend_http" {
  load_balancer_arn = aws_lb.backend.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# Target Group for backend service
resource "aws_lb_target_group" "backend" {
  name        = "otail-${var.environment}-backend"
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    timeout             = 5
    unhealthy_threshold = 3
  }

  tags = {
    Environment = var.environment
    Terraform   = "true"
  }
}

# Target group for WebSocket connections
resource "aws_lb_target_group" "websocket" {
  name        = "otail-${var.environment}-websocket"
  port        = 4320
  protocol    = "HTTP"
  vpc_id      = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    path               = "/health"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout            = 5
    interval           = 30
    matcher            = "200"
  }

  tags = {
    Environment = var.environment
    Terraform   = "true"
  }
}

# ALB Listener for WebSocket
resource "aws_lb_listener" "websocket" {
  load_balancer_arn = aws_lb.backend.arn
  port              = "4320"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate.main.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.websocket.arn
  }
}
