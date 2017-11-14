package se.persandstrom.nopestradamus.db.entity;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "participant")
public class Participant {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "id")
	private int id;

	@ManyToOne
	private PredictionVersion predictionVersion;

	@Column
	private String mail;

	@Column
	private boolean accepted;

	@Column
	private Date acceptedDate;
}
