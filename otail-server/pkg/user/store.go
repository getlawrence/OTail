package user

import (
	"context"
	"errors"
	"time"

	"github.com/mottibec/otail-server/pkg/telemetry"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type MongoUserStore struct {
	client     *mongo.Client
	collection *mongo.Collection
}

func NewMongoUserStore(uri string, dbName string) (*MongoUserStore, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	opts := options.Client()
	opts.Monitor = telemetry.NewMonitor()
	opts.ApplyURI(uri)

	client, err := mongo.Connect(opts)
	if err != nil {
		return nil, err
	}

	if err := client.Ping(ctx, nil); err != nil {
		return nil, err
	}

	collection := client.Database(dbName).Collection("users")

	indexes := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "email", Value: 1}},
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

func (s *MongoUserStore) CreateUser(user *User) (*User, error) {
	ctx := context.Background()

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

func (s *MongoUserStore) Close() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return s.client.Disconnect(ctx)
}
