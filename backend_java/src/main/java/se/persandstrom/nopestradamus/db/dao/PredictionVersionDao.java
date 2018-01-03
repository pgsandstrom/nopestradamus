package se.persandstrom.nopestradamus.db.dao;


import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import se.persandstrom.nopestradamus.db.entity.PredictionVersion;

@Transactional
@Repository
public class PredictionVersionDao {

	@PersistenceContext
	private EntityManager entityManager;

	@SuppressWarnings("unchecked")
	public List<PredictionVersion> getAll() {
		String hql = "FROM PredictionVersion as PredictionVersion2 ORDER BY PredictionVersion2.id";
		return (List<PredictionVersion>) entityManager.createQuery(hql).getResultList();
	}

	public void addPredictionVersion(PredictionVersion predictionVersion) {
		entityManager.persist(predictionVersion);
		entityManager.flush();
	}
}
