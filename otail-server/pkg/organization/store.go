package organization

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type MongoOrgStore struct {
	client     *mongo.Client
	collection *mongo.Collection
}

func NewMongOrgStore(uri string, dbName string) (*MongoOrgStore, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(options.Client().ApplyURI(uri))
	if err != nil {
		return nil, err
	}

	if err := client.Ping(ctx, nil); err != nil {
		return nil, err
	}

	collection := client.Database(dbName).Collection("organizations")

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

	return &MongoOrgStore{
		client:     client,
		collection: collection,
	}, nil
}

func (s *MongoOrgStore) CreateOrganization(name string) (string, error) {
	ctx := context.Background()
	org := Organization{
		Name: name,
	}
	res, err := s.collection.InsertOne(ctx, org)
	if err != nil {
		return "", err
	}

	if res.InsertedID == nil || !res.Acknowledged {
		return "nil", errors.New("failed to create org")
	}
	return res.InsertedID.(string), nil
}

func (s *MongoOrgStore) OrganizationExists(name string) bool {
	org := Organization{}
	err := s.collection.FindOne(context.Background(), bson.M{"name": name}).Decode(&org)
	return err != nil
}

func (s *MongoOrgStore) JoinOrganization(name string, userId string) (string, error) {
	members := []string{userId}
	res, err := s.collection.UpdateOne(context.Background(), bson.M{"name": name}, bson.M{"members": members})
	return res.UpsertedID.(string), err
}

func (s *MongoOrgStore) Close() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return s.client.Disconnect(ctx)
}
