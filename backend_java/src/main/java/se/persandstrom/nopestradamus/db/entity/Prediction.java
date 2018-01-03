package se.persandstrom.nopestradamus.db.entity;

import java.util.Arrays;
import java.util.Date;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;

@Entity
@Table(name = "prediction")
public class Prediction {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "id")
	private int id;

	@OneToMany(mappedBy = "prediction", cascade = CascadeType.ALL)
	private List<PredictionVersion> predictions;

	@Column
	private Date created;

	@Column
	private boolean visible;

	@Column
	private String secretIdentifier;

	public Prediction() {
	}

	public Prediction(PredictionVersion initialPrediciton) {
		this.predictions = Arrays.asList(initialPrediciton);
		this.created = new Date();
	}

	public List<PredictionVersion> getPredictions() {
		return predictions;
	}

	public Date getCreated() {
		return created;
	}
}
