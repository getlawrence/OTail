package organization

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

type mongoOrgStore struct {
	client      *mongo.Client
	db          *mongo.Database
	collection  *mongo.Collection
	invitesColl *mongo.Collection
	membersColl *mongo.Collection
}

type MongoOrgStore interface {
	CreateOrganization(name string) (string, error)
	OrganizationExists(name string) bool
	GetOrganization(id string) (*Organization, error)
	GetOrganizationMembers(id string) ([]OrganizationMember, error)
	GetOrganizationInvites(id string) ([]OrganizationInvite, error)
	SaveInvite(invite *OrganizationInvite) error
	GetInvite(token string) (*OrganizationInvite, error)
	MarkInviteAsUsed(token string) error
	AddUserToOrganization(organizationId string, userId string, email string, role string) error
	Close() error
}

func NewMongOrgStore(uri string, dbName string) (MongoOrgStore, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(options.Client().ApplyURI(uri))
	if err != nil {
		return nil, err
	}

	db := client.Database(dbName)
	store := &mongoOrgStore{
		client:      client,
		db:          db,
		collection:  db.Collection("organizations"),
		invitesColl: db.Collection("organization_invites"),
		membersColl: db.Collection("organization_members"),
	}

	// Create indexes
	if err := store.createIndexes(ctx); err != nil {
		return nil, err
	}

	return store, nil
}

func (s *mongoOrgStore) createIndexes(ctx context.Context) error {
	// Organization indexes
	orgIndexes := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "name", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
	}

	// Invite indexes
	inviteIndexes := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "token", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys: bson.D{
				bson.E{Key: "organization_id", Value: 1},
				bson.E{Key: "expires_at", Value: 1},
				bson.E{Key: "used", Value: 1},
			},
		},
	}

	// Member indexes
	memberIndexes := []mongo.IndexModel{
		{
			Keys: bson.D{
				bson.E{Key: "organization_id", Value: 1},
				bson.E{Key: "user_id", Value: 1},
			},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys: bson.D{bson.E{Key: "user_id", Value: 1}},
		},
	}

	// Create indexes for each collection
	if _, err := s.collection.Indexes().CreateMany(ctx, orgIndexes); err != nil {
		return fmt.Errorf("failed to create organization indexes: %v", err)
	}

	if _, err := s.invitesColl.Indexes().CreateMany(ctx, inviteIndexes); err != nil {
		return fmt.Errorf("failed to create invite indexes: %v", err)
	}

	if _, err := s.membersColl.Indexes().CreateMany(ctx, memberIndexes); err != nil {
		return fmt.Errorf("failed to create member indexes: %v", err)
	}

	return nil
}

func (s *mongoOrgStore) SaveInvite(invite *OrganizationInvite) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := s.invitesColl.InsertOne(ctx, invite)
	return err
}

func (s *mongoOrgStore) GetInvite(token string) (*OrganizationInvite, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var invite OrganizationInvite
	err := s.invitesColl.FindOne(ctx, bson.M{"token": token}).Decode(&invite)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("invite not found")
		}
		return nil, err
	}

	return &invite, nil
}

func (s *mongoOrgStore) MarkInviteAsUsed(token string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"used": true,
		},
	}

	result, err := s.invitesColl.UpdateOne(ctx, bson.M{"token": token}, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		return errors.New("invite not found")
	}

	return nil
}

func (s *mongoOrgStore) AddUserToOrganization(organizationId string, userId string, email string, role string) error {
	ctx := context.Background()
	member := OrganizationMember{
		UserID:    userId,
		Email:     email,
		JoinedAt:  time.Now(),
		Role:      role,
	}

	_, err := s.membersColl.InsertOne(ctx, bson.M{
		"organization_id": organizationId,
		"user_id":        member.UserID,
		"email":          member.Email,
		"joined_at":      member.JoinedAt,
		"role":           member.Role,
	})
	if err != nil {
		return fmt.Errorf("failed to add user to organization: %w", err)
	}

	return nil
}

func (s *mongoOrgStore) CreateOrganization(name string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	org := &Organization{
		ID:        uuid.New().String(),
		Name:      name,
		CreatedAt: time.Now(),
	}

	_, err := s.collection.InsertOne(ctx, org)
	if err != nil {
		return "", err
	}

	return org.ID, nil
}

func (s *mongoOrgStore) OrganizationExists(name string) bool {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	count, err := s.collection.CountDocuments(ctx, bson.M{"name": name})
	if err != nil {
		return false
	}

	return count > 0
}

func (s *mongoOrgStore) GetOrganization(id string) (*Organization, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var org Organization
	err := s.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&org)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("organization not found")
		}
		return nil, err
	}

	return &org, nil
}

func (s *mongoOrgStore) GetOrganizationMembers(id string) ([]OrganizationMember, error) {
	ctx := context.Background()
	cursor, err := s.membersColl.Find(ctx, bson.M{"organization_id": id})
	if err != nil {
		return nil, fmt.Errorf("failed to get organization members: %w", err)
	}
	defer cursor.Close(ctx)

	var members []OrganizationMember
	if err := cursor.All(ctx, &members); err != nil {
		return nil, fmt.Errorf("failed to decode organization members: %w", err)
	}
	return members, nil
}

func (s *mongoOrgStore) GetOrganizationInvites(id string) ([]OrganizationInvite, error) {
	ctx := context.Background()
	cursor, err := s.invitesColl.Find(ctx, bson.M{
		"organization_id": id,
		"used":            false,
		"expires_at":      bson.M{"$gt": time.Now()},
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get organization invites: %w", err)
	}
	defer cursor.Close(ctx)

	var invites []OrganizationInvite
	if err := cursor.All(ctx, &invites); err != nil {
		return nil, fmt.Errorf("failed to decode organization invites: %w", err)
	}
	return invites, nil
}

func (s *mongoOrgStore) Close() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return s.client.Disconnect(ctx)
}
