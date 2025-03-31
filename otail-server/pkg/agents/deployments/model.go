package deployments

import (
	"context"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.uber.org/zap"
)

type Deployment struct {
	ID        string    `bson:"_id" json:"id"`
	Name      string    `bson:"name" json:"name"`
	GroupIDs  []string  `bson:"group_ids" json:"group_ids"`
	CreatedAt time.Time `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time `bson:"updated_at" json:"updated_at"`
}

type Store interface {
	Create(ctx context.Context, deployment *Deployment) error
	Get(ctx context.Context, id string) (*Deployment, error)
	List(ctx context.Context) ([]*Deployment, error)
	Update(ctx context.Context, deployment *Deployment) error
	Delete(ctx context.Context, id string) error
	AddGroup(ctx context.Context, deploymentID, groupID string) error
	RemoveGroup(ctx context.Context, deploymentID, groupID string) error
}

type MongoStore struct {
	collection *mongo.Collection
	logger     *zap.Logger
}

func NewMongoStore(db *mongo.Database, logger *zap.Logger) *MongoStore {
	return &MongoStore{
		collection: db.Collection("deployments"),
		logger:     logger,
	}
}

func (s *MongoStore) Create(ctx context.Context, deployment *Deployment) error {
	deployment.ID = uuid.New().String()
	deployment.CreatedAt = time.Now()
	deployment.UpdatedAt = time.Now()

	_, err := s.collection.InsertOne(ctx, deployment)
	return err
}

func (s *MongoStore) Get(ctx context.Context, name string) (*Deployment, error) {
	var deployment Deployment
	err := s.collection.FindOne(ctx, bson.M{"name": name}).Decode(&deployment)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &deployment, nil
}

func (s *MongoStore) List(ctx context.Context) ([]*Deployment, error) {
	cursor, err := s.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var deployments []*Deployment
	if err := cursor.All(ctx, &deployments); err != nil {
		return nil, err
	}
	return deployments, nil
}

func (s *MongoStore) Update(ctx context.Context, deployment *Deployment) error {
	deployment.UpdatedAt = time.Now()
	_, err := s.collection.ReplaceOne(ctx, bson.M{"_id": deployment.ID}, deployment)
	return err
}

func (s *MongoStore) Delete(ctx context.Context, id string) error {
	_, err := s.collection.DeleteOne(ctx, bson.M{"_id": id})
	return err
}

func (s *MongoStore) AddGroup(ctx context.Context, deploymentID, groupID string) error {
	_, err := s.collection.UpdateOne(
		ctx,
		bson.M{"_id": deploymentID},
		bson.M{
			"$set": bson.M{
				"updated_at": time.Now(),
			},
			"$addToSet": bson.M{"group_ids": groupID},
		},
	)
	return err
}

func (s *MongoStore) RemoveGroup(ctx context.Context, deploymentID, groupID string) error {
	_, err := s.collection.UpdateOne(
		ctx,
		bson.M{"_id": deploymentID},
		bson.M{
			"$pull": bson.M{"group_ids": groupID},
			"$set":  bson.M{"updated_at": time.Now()},
		},
	)
	return err
}
