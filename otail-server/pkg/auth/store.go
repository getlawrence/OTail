package auth

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type MongoUserStore struct {
	client     *mongo.Client
	collection *mongo.Collection
}

// Ensure MongoUserStore implements UserStore interface
var _ UserStore = (*MongoUserStore)(nil)

func NewMongoUserStore(uri string, dbName string) (*MongoUserStore, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(options.Client().ApplyURI(uri))
	if err != nil {
		return nil, err
	}

	// Ping the database to verify connection
	if err := client.Ping(ctx, nil); err != nil {
		return nil, err
	}

	collection := client.Database(dbName).Collection("users")

	// Create indexes
	indexes := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "email", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys:    bson.D{{Key: "api_token", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
	}

	_, err = collection.Indexes().CreateMany(ctx, indexes)
	if err != nil {
		return nil, err
	}

	return &MongoUserStore{
		client:     client,
		collection: collection,
	}, nil
}

func (s *MongoUserStore) CreateUser(email, password string) (*User, error) {
	ctx := context.Background()

	// Check if user exists
	var existingUser User
	err := s.collection.FindOne(ctx, bson.M{"email": email}).Decode(&existingUser)
	if err == nil {
		return nil, errors.New("user already exists")
	} else if err != mongo.ErrNoDocuments {
		return nil, err
	}

	hashedPassword, err := HashPassword(password)
	if err != nil {
		return nil, err
	}

	apiToken, err := GenerateAPIToken()
	if err != nil {
		return nil, err
	}
	fmt.Println(apiToken)

	user := &User{
		ID:        uuid.New().String(),
		Email:     email,
		Password:  []byte(hashedPassword),
		APIToken:  apiToken,
		CreatedAt: time.Now(),
	}

	res, err := s.collection.InsertOne(ctx, user)
	if err != nil {
		return nil, err
	}

	if res.InsertedID == nil || !res.Acknowledged {
		return nil, errors.New("failed to insert user")
	}
	return user, nil
}

func (s *MongoUserStore) GetUserByEmail(email string) (*User, error) {
	ctx := context.Background()
	var user User
	err := s.collection.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err == mongo.ErrNoDocuments {
		return nil, ErrUserNotFound
	} else if err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *MongoUserStore) GetUserByToken(token string) (*User, error) {
	ctx := context.Background()
	var user User
	err := s.collection.FindOne(ctx, bson.M{"api_token": token}).Decode(&user)
	if err == mongo.ErrNoDocuments {
		return nil, ErrInvalidToken
	} else if err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *MongoUserStore) ValidatePassword(user *User, password string) bool {
	return ValidatePassword(string(user.Password), password)
}

// Close closes the MongoDB connection
func (s *MongoUserStore) Close() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return s.client.Disconnect(ctx)
}
