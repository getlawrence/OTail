package groups

import (
	"context"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.uber.org/zap"
)

type AgentGroup struct {
	ID           string    `bson:"_id" json:"id"`
	Name         string    `bson:"name" json:"name"`
	Config       []byte    `bson:"config" json:"config"`
	AgentIDs     []string  `bson:"agent_ids" json:"agent_ids"`
	DeploymentID string    `bson:"deployment_id" json:"deployment_id"`
	CreatedAt    time.Time `bson:"created_at" json:"created_at"`
	UpdatedAt    time.Time `bson:"updated_at" json:"updated_at"`
}

type Store interface {
	Create(ctx context.Context, group *AgentGroup) error
	Get(ctx context.Context, id string) (*AgentGroup, error)
	List(ctx context.Context, deploymentID string) ([]*AgentGroup, error)
	Update(ctx context.Context, group *AgentGroup) error
	Delete(ctx context.Context, id string) error
	AddAgent(ctx context.Context, groupID, agentID string) error
	RemoveAgent(ctx context.Context, groupID, agentID string) error
}

type MongoStore struct {
	collection *mongo.Collection
	logger     *zap.Logger
}

func NewMongoStore(db *mongo.Database, logger *zap.Logger) *MongoStore {
	return &MongoStore{
		collection: db.Collection("agent_groups"),
		logger:     logger,
	}
}

func (s *MongoStore) Create(ctx context.Context, group *AgentGroup) error {
	group.ID = uuid.New().String()
	group.CreatedAt = time.Now()
	group.UpdatedAt = time.Now()

	_, err := s.collection.InsertOne(ctx, group)
	return err
}

func (s *MongoStore) Get(ctx context.Context, name string) (*AgentGroup, error) {
	var group AgentGroup
	err := s.collection.FindOne(ctx, bson.M{"name": name}).Decode(&group)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &group, nil
}

func (s *MongoStore) List(ctx context.Context, deploymentID string) ([]*AgentGroup, error) {
	cursor, err := s.collection.Find(ctx, bson.M{"deployment_id": deploymentID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var groups []*AgentGroup
	if err := cursor.All(ctx, &groups); err != nil {
		return nil, err
	}
	return groups, nil
}

func (s *MongoStore) Update(ctx context.Context, group *AgentGroup) error {
	group.UpdatedAt = time.Now()
	_, err := s.collection.ReplaceOne(ctx, bson.M{"_id": group.ID}, group)
	return err
}

func (s *MongoStore) Delete(ctx context.Context, id string) error {
	_, err := s.collection.DeleteOne(ctx, bson.M{"_id": id})
	return err
}

func (s *MongoStore) AddAgent(ctx context.Context, groupID, agentID string) error {
	_, err := s.collection.UpdateOne(
		ctx,
		bson.M{"_id": groupID},
		bson.M{
			"$addToSet": bson.M{"agent_ids": agentID},
			"$set":      bson.M{"updated_at": time.Now()},
		},
	)
	return err
}

func (s *MongoStore) RemoveAgent(ctx context.Context, groupID, agentID string) error {
	_, err := s.collection.UpdateOne(
		ctx,
		bson.M{"_id": groupID},
		bson.M{
			"$pull": bson.M{"agent_ids": agentID},
			"$set":  bson.M{"updated_at": time.Now()},
		},
	)
	return err
}
