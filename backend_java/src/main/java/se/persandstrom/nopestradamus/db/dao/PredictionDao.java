package se.persandstrom.nopestradamus.db.dao;


import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import se.persandstrom.nopestradamus.db.entity.Prediction;

@Transactional
@Repository
public class PredictionDao {

	@PersistenceContext
	private EntityManager entityManager;

	@SuppressWarnings("unchecked")
	public List<Prediction> getAll() {
		String hql = "FROM Prediction as prediction2 ORDER BY prediction2.id";
		return (List<Prediction>) entityManager.createQuery(hql).getResultList();
	}

	public void addPrediction(Prediction prediction) {
		entityManager.persist(prediction);
		entityManager.flush();
	}
}
