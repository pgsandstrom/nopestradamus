package se.persandstrom.nopestradamus.db.entity;

import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;

@Entity
@Table(name = "prediction_version")
public class PredictionVersion {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "id")
	private int id;

	@ManyToOne
	private Prediction prediction;

	@OneToMany(mappedBy = "predictionVersion", cascade = CascadeType.ALL)
	private List<Participant> participants;

	@Column
	String title;

	@Column
	String body;

	public PredictionVersion() {
	}

	public PredictionVersion(Prediction prediction) {
		this.prediction = prediction;
	}

	public PredictionVersion(String title) {
		this.title = title;
	}

	public Prediction getPrediction() {
		return prediction;
	}

	public void setPrediction(Prediction prediction) {
		this.prediction = prediction;
	}
}
